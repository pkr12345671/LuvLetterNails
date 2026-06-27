/* =========================================================
   Luv Letter — admin dashboard
   Lists/manages bookings + blackout time. Uses the same Supabase
   client as the site (window.LLBooking.sb); admin access is enforced
   by Row-Level Security (is_admin()).
   ========================================================= */
(function () {
  const LL = window.LLBooking;
  const $ = (id) => document.getElementById(id);

  if (!LL || !LL.enabled) {
    $("notConfigured").hidden = false;
    return;
  }
  const sb = LL.sb;

  const msg = (t, kind) => { const el = $("adminMsg"); el.textContent = t; el.className = kind || ""; };
  const fmtWhen = (iso) =>
    new Date(iso).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

  let pendingEmail = null;

  async function init() {
    const user = await LL.getUser();
    if (user) return afterSignIn(user);
    $("signIn").hidden = false;
  }

  /* ----- sign-in (email OTP) ----- */
  $("adSend").addEventListener("click", async () => {
    const email = $("ad-email").value.trim();
    if (!email) return msg("Enter your email.", "err");
    msg("Emailing you a code…");
    const { error } = await LL.sendCode(email);
    if (error) return msg(error.message || "Couldn’t send a code.", "err");
    pendingEmail = email;
    $("adOtpRow").hidden = false;
    $("ad-otp").focus();
    msg("Check your email and enter the 6-digit code.", "ok");
  });
  $("adVerify").addEventListener("click", async () => {
    const code = $("ad-otp").value.trim();
    if (code.length < 6) return msg("Enter the 6-digit code.", "err");
    msg("Verifying…");
    const { error } = await LL.verifyCode(pendingEmail, code);
    if (error) return msg("That code didn’t match.", "err");
    const user = await LL.getUser();
    afterSignIn(user);
  });
  $("adSignOut").addEventListener("click", async () => { await LL.signOut(); location.reload(); });

  /* ----- after sign-in: confirm admin, load data ----- */
  async function afterSignIn(user) {
    // make sure a profile row exists, then check admin flag
    await sb.from("profiles").upsert({ id: user.id, email: user.email }, { onConflict: "id" });
    const { data: prof } = await sb.from("profiles").select("is_admin").eq("id", user.id).single();
    if (!prof || !prof.is_admin) {
      $("signIn").hidden = false;
      msg("This account isn’t an admin yet. In Supabase run: update profiles set is_admin=true where email='" + user.email + "';", "err");
      return;
    }
    $("signIn").hidden = true;
    $("dashboard").hidden = false;
    loadBookings();
    loadBlackouts();
  }

  /* ----- bookings ----- */
  async function loadBookings() {
    const { data, error } = await sb
      .from("bookings")
      .select("*, profiles(full_name, email, phone)")
      .neq("status", "cancelled")
      .gte("start_ts", new Date().toISOString())
      .order("start_ts");
    const list = $("bookingList");
    if (error) { list.innerHTML = `<p class="err">${error.message}</p>`; return; }
    if (!data.length) { list.innerHTML = `<p class="muted">No upcoming bookings.</p>`; return; }
    list.innerHTML = data.map((b) => {
      const p = b.profiles || {};
      const addons = Array.isArray(b.addons) && b.addons.length
        ? `<div class="bk__who">Add-ons: ${b.addons.map((a) => a.name).join(", ")}</div>` : "";
      const pill = `<span class="pill pill--${b.status}">${b.status}</span>`;
      return `<div class="bk">
        <div>
          <div class="bk__when">${fmtWhen(b.start_ts)}</div>
          <div class="bk__svc">${b.service_name} ${pill}</div>
          ${addons}
          <div class="bk__who">${p.full_name || "—"} · ${p.email || ""} · ${p.phone || "no phone"}</div>
          ${b.notes ? `<div class="bk__who">📝 ${escapeHtml(b.notes)}</div>` : ""}
          <div class="bk__who">Est. ${b.price_estimate || "—"}</div>
        </div>
        <div class="bk__actions">
          ${b.status !== "confirmed" ? `<button class="btn btn--primary" data-confirm="${b.id}">Confirm</button>` : ""}
          <button class="btn btn--ghost" data-cancel="${b.id}">Cancel</button>
        </div>
      </div>`;
    }).join("");
    list.querySelectorAll("[data-confirm]").forEach((btn) =>
      btn.addEventListener("click", () => setStatus(btn.dataset.confirm, "confirmed")));
    list.querySelectorAll("[data-cancel]").forEach((btn) =>
      btn.addEventListener("click", () => { if (confirm("Cancel this booking?")) setStatus(btn.dataset.cancel, "cancelled"); }));
  }
  async function setStatus(id, status) {
    const { error } = await sb.from("bookings").update({ status }).eq("id", id);
    if (error) return msg(error.message, "err");
    loadBookings();
  }

  /* ----- blackouts ----- */
  $("boAdd").addEventListener("click", async () => {
    const start = $("bo-start").value, end = $("bo-end").value;
    if (!start || !end) return msg("Pick a start and end.", "err");
    const { error } = await sb.from("blackouts").insert({
      start_ts: new Date(start).toISOString(),
      end_ts: new Date(end).toISOString(),
      reason: $("bo-reason").value.trim() || null,
    });
    if (error) return msg(error.message, "err");
    $("bo-start").value = $("bo-end").value = $("bo-reason").value = "";
    msg("Time blocked off.", "ok");
    loadBlackouts();
  });
  async function loadBlackouts() {
    const { data } = await sb.from("blackouts").select("*").gte("end_ts", new Date().toISOString()).order("start_ts");
    const el = $("blackoutList");
    if (!data || !data.length) { el.innerHTML = `<p class="muted">No upcoming blocked time.</p>`; return; }
    el.innerHTML = data.map((b) =>
      `<div class="bk"><div><div class="bk__when">${fmtWhen(b.start_ts)} → ${fmtWhen(b.end_ts)}</div>${b.reason ? `<div class="bk__who">${escapeHtml(b.reason)}</div>` : ""}</div>
       <div class="bk__actions"><button class="btn btn--ghost" data-unblock="${b.id}">Remove</button></div></div>`).join("");
    el.querySelectorAll("[data-unblock]").forEach((btn) =>
      btn.addEventListener("click", async () => { await sb.from("blackouts").delete().eq("id", btn.dataset.unblock); loadBlackouts(); }));
  }

  function escapeHtml(s) { return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

  init();
})();
