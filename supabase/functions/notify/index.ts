// =============================================================================
// Luv Letter — booking notification (Supabase Edge Function)
// Sends the artist an email when a new booking is inserted.
//
// Triggered by a Database Webhook (Database → Webhooks) on INSERT into
// public.bookings. Sends mail via Resend (https://resend.com, free tier).
//
// Deploy:   supabase functions deploy notify --no-verify-jwt
// Secrets:  supabase secrets set RESEND_API_KEY=...  ARTIST_EMAIL=you@email.com  FROM_EMAIL="Luv Letter <onboarding@resend.dev>"
// =============================================================================
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const ARTIST_EMAIL = Deno.env.get("ARTIST_EMAIL") ?? "";
// Use Resend's shared sender until a domain is verified.
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "Luv Letter <onboarding@resend.dev>";

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    weekday: "long", month: "long", day: "numeric",
    hour: "numeric", minute: "2-digit", timeZone: "America/New_York",
  });

serve(async (req) => {
  try {
    const body = await req.json();
    // Database Webhook payload shape: { type, table, record, old_record }
    const b = body.record ?? body;
    if (!b || !b.start_ts) {
      return new Response("ignored", { status: 200 });
    }

    const addons = Array.isArray(b.addons) && b.addons.length
      ? b.addons.map((a: { name: string }) => a.name).join(", ")
      : "none";

    const html = `
      <h2>New booking 💅</h2>
      <p><strong>${b.service_name}</strong></p>
      <p><strong>When:</strong> ${fmt(b.start_ts)} – ${fmt(b.end_ts)}</p>
      <p><strong>Add-ons:</strong> ${addons}</p>
      <p><strong>Est. price:</strong> ${b.price_estimate ?? "—"}</p>
      ${b.notes ? `<p><strong>Notes:</strong> ${String(b.notes).replace(/</g, "&lt;")}</p>` : ""}
      <p style="color:#888">Review it in your admin dashboard (admin.html).</p>
    `;

    if (!RESEND_API_KEY || !ARTIST_EMAIL) {
      console.warn("RESEND_API_KEY or ARTIST_EMAIL not set — skipping email.");
      return new Response("no email config", { status: 200 });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [ARTIST_EMAIL],
        subject: `New booking — ${b.service_name} (${fmt(b.start_ts)})`,
        html,
      }),
    });

    if (!res.ok) {
      console.error("Resend error:", await res.text());
      return new Response("email failed", { status: 500 });
    }
    return new Response("ok", { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response("error", { status: 500 });
  }
});
