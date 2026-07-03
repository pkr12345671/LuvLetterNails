/* =========================================================
   Luv Letter — interactions
   ---------------------------------------------------------
   ⚙️  CLIENT CONFIG — the few values you may want to change.
   ========================================================= */
const CONFIG = {
  // The artist's live Acuity scheduler — the Book section embeds this, so it
  // shows real availability and (with Square connected in Acuity) takes the $20
  // deposit. Replace with her exact Acuity link if it changes. Prefer pasting
  // her official embed <iframe> straight into #acuityEmbed in index.html — if an
  // iframe is already there, this is left alone.
  ACUITY_URL: "https://luvletternails.as.me/schedule/ea9af220",

  // Her Square store / checkout / payment link for press-on orders. Leave "" to
  // hide the Square button (press-ons stay a request form only).
  SQUARE_PRESSIES_URL: "",

  // Where the press-on "Request your set" form sends. "" → opens a pre-filled
  // email to CONTACT_EMAIL. To collect online, paste a free Formspree endpoint
  // (https://formspree.io), e.g. "https://formspree.io/f/abcdwxyz".
  FORM_ENDPOINT: "",

  // Inbox for the email links + mailto fallback.
  CONTACT_EMAIL: "hello@luvletternails.com",
};

document.addEventListener("DOMContentLoaded", () => {
  initYear();
  initNav();
  initReveal();
  initStamps();
  initMailto();
  initSquare();
  initAcuity();
  // Press-on "Request your set" form.
  wireForm("requestForm", "formMsg", "Press-on request");
});

/* ---------- Footer year ---------- */
function initYear() {
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
}

/* ---------- Mobile nav ---------- */
function initNav() {
  const nav = document.querySelector(".nav");
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("navMenu");
  if (!nav || !toggle || !menu) return;

  const setOpen = (open) => {
    menu.classList.toggle("open", open);
    nav.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };

  toggle.addEventListener("click", () => setOpen(!menu.classList.contains("open")));
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
}

/* ---------- Reveal on scroll ---------- */
function initReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || !els.length) {
    els.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  els.forEach((el) => io.observe(el));
}

/* ---------- Stamp picker (press-on designs) ---------- */
function initStamps() {
  const sheet = document.getElementById("stampSheet");
  if (!sheet) return;
  const designInput = document.getElementById("f-design");

  sheet.querySelectorAll(".stamp").forEach((stamp) => {
    stamp.setAttribute("type", "button");
    stamp.addEventListener("click", () => {
      const wasPicked = stamp.classList.contains("is-picked");
      sheet.querySelectorAll(".stamp.is-picked").forEach((s) => s.classList.remove("is-picked"));
      if (!wasPicked) {
        stamp.classList.add("is-picked");
        const name = stamp.dataset.design || "";
        const price = stamp.dataset.price || "";
        if (designInput) designInput.value = price ? `${name} (${price})` : name;
        // Glide to the request form so they can finish.
        document.getElementById("request")?.scrollIntoView({ behavior: "smooth", block: "start" });
        if (designInput) setTimeout(() => designInput.focus({ preventScroll: true }), 600);
      } else if (designInput) {
        designInput.value = "";
      }
    });
  });
}

/* ---------- Email (mailto) links ---------- */
function initMailto() {
  document.querySelectorAll(".js-mailto").forEach((a) => {
    a.href = `mailto:${CONFIG.CONTACT_EMAIL}`;
  });
}

/* ---------- Square press-on payments ---------- */
function initSquare() {
  const url = CONFIG.SQUARE_PRESSIES_URL;
  if (!url) return; // no link set → keep the Square button hidden
  document.querySelectorAll(".js-square").forEach((a) => { a.href = url; });
  const cta = document.getElementById("squareCta");
  if (cta) cta.hidden = false;
}

/* ---------- Acuity scheduler embed (in-person booking) ---------- */
function initAcuity() {
  const mount = document.getElementById("acuityEmbed");
  if (!mount) return;

  const fallback = document.getElementById("acuityFallback");
  if (fallback) fallback.href = CONFIG.ACUITY_URL;

  // If the client pasted their official Acuity embed (an <iframe>), leave it.
  if (mount.querySelector("iframe")) return;

  const iframe = document.createElement("iframe");
  iframe.src = CONFIG.ACUITY_URL;
  iframe.title = "Book an appointment with Luv Letter";
  iframe.width = "100%";
  iframe.height = "800";
  iframe.frameBorder = "0";
  iframe.loading = "lazy";
  iframe.setAttribute("allow", "payment");
  mount.innerHTML = "";
  mount.appendChild(iframe);

  // Acuity's helper auto-resizes the iframe to fit its content.
  if (!document.getElementById("acuity-embed-js")) {
    const s = document.createElement("script");
    s.id = "acuity-embed-js";
    s.src = "https://embed.acuityscheduling.com/js/embed.js";
    s.async = true;
    document.body.appendChild(s);
  }
}

/* ---------- Shared request delivery ----------
   Returns "sent" (POSTed online), "mailto" (opened an email draft), or false.
   The email body is built from every named, non-empty field.
*/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function makeSay(msgEl) {
  return (text, kind) => {
    if (!msgEl) return;
    msgEl.textContent = text;
    msgEl.className = "postcard__msg" + (kind ? " " + kind : "");
  };
}

async function deliverRequest(data, subjectPrefix, name, say) {
  const prettify = (k) => k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  if (CONFIG.FORM_ENDPOINT) {
    try {
      say("Sealing your note…", "");
      data.append("_subject", `${subjectPrefix} from ${name}`);
      const res = await fetch(CONFIG.FORM_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
      });
      if (res.ok) return "sent";
      say("Hmm, that didn’t send. Try the email link below.", "err");
      return false;
    } catch {
      say("Network hiccup — please use the email link below.", "err");
      return false;
    }
  }

  // No endpoint → open a pre-filled email (mailto fallback).
  const lines = [];
  for (const [key, value] of data.entries()) {
    const v = value.toString().trim();
    if (v) lines.push(`${prettify(key)}: ${v}`);
  }
  const href =
    `mailto:${CONFIG.CONTACT_EMAIL}` +
    `?subject=${encodeURIComponent(`${subjectPrefix} from ${name}`)}` +
    `&body=${encodeURIComponent(lines.join("\n"))}`;
  window.location.href = href;
  return "mailto";
}

/* ---------- Press-on "Request your set" form ---------- */
function wireForm(formId, msgId, subjectPrefix) {
  const form = document.getElementById(formId);
  if (!form) return;
  const say = makeSay(document.getElementById(msgId));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = (data.get("name") || "").toString().trim();
    const email = (data.get("email") || "").toString().trim();
    if (!name || !email || !EMAIL_RE.test(email)) {
      say("Please add your name and a valid email so I can write back. 💌", "err");
      return;
    }
    const result = await deliverRequest(data, subjectPrefix, name, say);
    if (result === "sent") { form.reset(); say("Sent with love! I’ll write back soon. 💌", "ok"); }
    else if (result === "mailto") { say("Opening your email to send the request… 💌", "ok"); }
  });
}
