/* =========================================================
   Luv Letter — interactions
   ---------------------------------------------------------
   ⚙️  CLIENT CONFIG — edit these two values, nothing else needed.
   ========================================================= */
const CONFIG = {
  // Where the request forms send (both the press-on "Request your set" and the
  // in-person appointment request). Leave as "" to use the email (mailto)
  // fallback. To collect submissions online, create a free Formspree form
  // (https://formspree.io) and paste its endpoint here, e.g.
  // "https://formspree.io/f/abcdwxyz".
  FORM_ENDPOINT: "",

  // Inbox the postcard / mailto fallback writes to.
  CONTACT_EMAIL: "hello@luvletternails.com",
};

document.addEventListener("DOMContentLoaded", () => {
  initYear();
  initNav();
  initReveal();
  initStamps();
  initMailto();
  // Wire both request forms. Each has its own email subject line.
  wireForm("requestForm", "formMsg", "Press-on request");
  wireForm("bookingForm", "bookingMsg", "Appointment request");
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

/* ---------- Stamp picker ---------- */
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

/* ---------- Request forms (press-on + appointment) ----------
   Both forms behave the same: validate, then POST to FORM_ENDPOINT if set,
   otherwise open a pre-filled email. The mailto body is built from every
   named, non-empty field, so adding/removing fields in the HTML "just works".
*/
function wireForm(formId, msgId, subjectPrefix) {
  const form = document.getElementById(formId);
  if (!form) return;
  const msg = document.getElementById(msgId);

  const say = (text, kind) => {
    if (!msg) return;
    msg.textContent = text;
    msg.className = "postcard__msg" + (kind ? " " + kind : "");
  };

  const prettify = (key) =>
    key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = (data.get("name") || "").toString().trim();
    const email = (data.get("email") || "").toString().trim();

    if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      say("Please add your name and a valid email so I can write back. 💌", "err");
      return;
    }

    // Online endpoint configured → POST it.
    if (CONFIG.FORM_ENDPOINT) {
      try {
        say("Sealing your note…", "");
        data.append("_subject", `${subjectPrefix} from ${name}`);
        const res = await fetch(CONFIG.FORM_ENDPOINT, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: data,
        });
        if (res.ok) {
          form.reset();
          say("Sent with love! I’ll write back soon. 💌", "ok");
        } else {
          say("Hmm, that didn’t send. Try the email link below.", "err");
        }
      } catch {
        say("Network hiccup — please use the email link below.", "err");
      }
      return;
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
    say("Opening your email to send the request… 💌", "ok");
  });
}
