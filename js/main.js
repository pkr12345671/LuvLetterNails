/* =========================================================
   Luv Letter — interactions
   ---------------------------------------------------------
   ⚙️  CLIENT CONFIG — edit these two values, nothing else needed.
   ========================================================= */
const CONFIG = {
  // Acuity scheduling page. Replace with the artist's link if it ever changes.
  // (Tip: in Acuity → Customize Appearance you can also grab a full embed
  //  snippet; if you do, paste it into #acuityEmbed in index.html instead.)
  ACUITY_URL: "https://luvletternails.as.me/schedule/ea9af220",

  // Where the "Request your set" form sends. Leave as "" to use the email
  // (mailto) fallback. To collect submissions online, create a free Formspree
  // form (https://formspree.io) and paste its endpoint here, e.g.
  // "https://formspree.io/f/abcdwxyz".
  FORM_ENDPOINT: "",

  // Inbox the postcard/mailto fallback writes to.
  CONTACT_EMAIL: "hello@luvletternails.com",
};

document.addEventListener("DOMContentLoaded", () => {
  initYear();
  initNav();
  initReveal();
  initStamps();
  initAcuity();
  initForm();
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

/* ---------- Acuity embed ---------- */
function initAcuity() {
  const mount = document.getElementById("acuityEmbed");
  if (!mount) return;

  // If the client pasted a full Acuity embed (an <iframe> already present),
  // leave it alone.
  if (mount.querySelector("iframe")) return;

  const iframe = document.createElement("iframe");
  iframe.src = CONFIG.ACUITY_URL;
  iframe.title = "Book an appointment with Luv Letter";
  iframe.loading = "lazy";
  iframe.width = "100%";
  iframe.height = "800";
  iframe.frameBorder = "0";
  iframe.setAttribute("allow", "payment");

  // Replace the <noscript> fallback with the live scheduler.
  mount.innerHTML = "";
  mount.appendChild(iframe);

  // Acuity's helper script makes the iframe auto-resize when it can.
  if (!document.getElementById("acuity-embed-js")) {
    const s = document.createElement("script");
    s.id = "acuity-embed-js";
    s.src = "https://embed.acuityscheduling.com/js/embed.js";
    s.async = true;
    document.body.appendChild(s);
  }
}

/* ---------- Request form ---------- */
function initForm() {
  const form = document.getElementById("requestForm");
  const msg = document.getElementById("formMsg");
  const mailto = document.getElementById("mailtoLink");
  if (mailto) mailto.href = `mailto:${CONFIG.CONTACT_EMAIL}`;
  if (!form) return;

  const say = (text, kind) => {
    if (!msg) return;
    msg.textContent = text;
    msg.className = "postcard__msg" + (kind ? " " + kind : "");
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = (data.get("name") || "").toString().trim();
    const email = (data.get("email") || "").toString().trim();

    if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      say("Please add your name and a valid email so we can write back. 💌", "err");
      return;
    }

    // Online endpoint configured → POST it.
    if (CONFIG.FORM_ENDPOINT) {
      try {
        say("Sealing your note…", "");
        const res = await fetch(CONFIG.FORM_ENDPOINT, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: data,
        });
        if (res.ok) {
          form.reset();
          say("Sent with love! We’ll write back soon. 💌", "ok");
        } else {
          say("Hmm, that didn’t send. Try the email link below.", "err");
        }
      } catch {
        say("Network hiccup — please use the email link below.", "err");
      }
      return;
    }

    // No endpoint → open a pre-filled email (mailto fallback).
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Design: ${data.get("design") || ""}`,
      `Shape: ${data.get("shape") || ""}`,
      `Length: ${data.get("length") || ""}`,
      `Sizing: ${data.get("sizing") || ""}`,
      ``,
      `Notes:`,
      `${data.get("notes") || ""}`,
    ].join("\n");
    const href =
      `mailto:${CONFIG.CONTACT_EMAIL}` +
      `?subject=${encodeURIComponent("Press-on request from " + name)}` +
      `&body=${encodeURIComponent(body)}`;
    window.location.href = href;
    say("Opening your email to send the request… 💌", "ok");
  });
}
