/* =========================================================
   Luv Letter — interactions
   ---------------------------------------------------------
   ⚙️  CLIENT CONFIG — edit CONFIG (contact) and BOOKING (services + hours).
   ========================================================= */
const CONFIG = {
  // Where the request forms send (press-on "Request your set" AND the booking
  // request). Leave as "" to use the email (mailto) fallback. To collect
  // submissions online, create a free Formspree form (https://formspree.io)
  // and paste its endpoint here, e.g. "https://formspree.io/f/abcdwxyz".
  FORM_ENDPOINT: "",

  // Inbox the postcard / mailto fallback writes to.
  CONTACT_EMAIL: "hello@luvletternails.com",
};

/* ---------------------------------------------------------
   BOOKING — the in-studio scheduler. Edit these to match the
   artist's real services and hours; the calendar + time slots
   are generated from this automatically.
   NOTE: this is a request-based scheduler (a static site can't
   see which slots are already taken). The artist confirms each
   request and deconflicts before charging a deposit.
   --------------------------------------------------------- */
const BOOKING = {
  // Step 1 services. Edit name / min (minutes) / price / desc / cat freely.
  services: [
    { cat: "Full sets", name: "Gel-X / Builder Gel Full Set", min: 90, price: "$75", desc: "A brand-new custom set, shaped and designed start to finish." },
    { cat: "Full sets", name: "Acrylic Full Set", min: 90, price: "$70", desc: "Durable acrylic set in your shape and length." },
    { cat: "Fills & maintenance", name: "Fill / Refresh", min: 60, price: "$50", desc: "Rebalance and refresh an existing set (2–3 weeks)." },
    { cat: "Fills & maintenance", name: "Gel Manicure", min: 45, price: "$40", desc: "Natural-nail gel polish, cuticle care, shape." },
    { cat: "Press-ons", name: "Press-On Application", min: 30, price: "$25", desc: "Apply a Luv Letter press-on set in studio." },
    { cat: "Press-ons", name: "Custom Press-On Fitting", min: 45, price: "$35", desc: "Get sized and matched for a made-to-order set." },
    { cat: "Add-ons & care", name: "Nail Art (simple)", min: 30, price: "from $10", desc: "Add a little art to your appointment." },
    { cat: "Add-ons & care", name: "Soak-Off / Removal", min: 30, price: "$20", desc: "Safe removal of a previous set." },
  ],

  // Weekly hours by weekday (0=Sun … 6=Sat). Each day is a list of [open, close]
  // ranges in 24h "HH:MM". An empty list means closed that day.
  hours: {
    0: [],                       // Sunday — closed
    1: [],                       // Monday — closed
    2: [["10:00", "18:00"]],     // Tuesday
    3: [["10:00", "18:00"]],     // Wednesday
    4: [["10:00", "19:00"]],     // Thursday
    5: [["10:00", "19:00"]],     // Friday
    6: [["09:00", "16:00"]],     // Saturday
  },

  slotMinutes: 30,   // spacing between appointment start times
  leadHours: 24,     // earliest you can request from "now"
  maxDaysAhead: 60,  // how far ahead the calendar opens
};

document.addEventListener("DOMContentLoaded", () => {
  initYear();
  initNav();
  initReveal();
  initStamps();
  initMailto();
  // Press-on "Request your set" form.
  wireForm("requestForm", "formMsg", "Press-on request");
  // In-studio scheduler (service → date → time → details).
  initBooker();
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

/* ---------- In-studio scheduler ----------
   Service → calendar date → available time slot → details. Slots are generated
   from BOOKING.hours / slotMinutes / leadHours, scoped to the chosen service's
   duration. Submits as a request (see note on BOOKING).
*/
function initBooker() {
  const root = document.getElementById("booker");
  if (!root) return;

  const state = { service: null, date: null, time: null };
  const panels = root.querySelectorAll(".booker__panel");
  const steps = root.querySelectorAll(".booker__steps li");

  const show = (n) => {
    panels.forEach((p) => (p.hidden = p.dataset.panel !== String(n)));
    steps.forEach((s) => s.classList.toggle("is-active", +s.dataset.step <= n));
    root.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // date/time helpers
  const pad = (x) => String(x).padStart(2, "0");
  const toMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  const fmt12 = (t) => { let [h, m] = t.split(":").map(Number); const ap = h < 12 ? "AM" : "PM"; h = h % 12 || 12; return `${h}:${pad(m)} ${ap}`; };
  const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const monthLabel = (d) => d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const longDate = (d) => d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today); maxDate.setDate(maxDate.getDate() + BOOKING.maxDaysAhead);

  const slotsFor = (date) => {
    if (!state.service) return [];
    const ranges = BOOKING.hours[date.getDay()] || [];
    const lead = new Date(Date.now() + BOOKING.leadHours * 3600e3);
    const dur = state.service.min;
    const out = [];
    for (const [open, close] of ranges) {
      for (let t = toMin(open); t + dur <= toMin(close); t += BOOKING.slotMinutes) {
        const dt = new Date(date); dt.setHours(0, 0, 0, 0); dt.setMinutes(t);
        if (dt >= lead) out.push(`${pad(Math.floor(t / 60))}:${pad(t % 60)}`);
      }
    }
    return out;
  };
  const monthHasOpen = (v) => {
    const y = v.getFullYear(), m = v.getMonth(), days = new Date(y, m + 1, 0).getDate();
    for (let d = 1; d <= days; d++) {
      const date = new Date(y, m, d);
      if (date >= today && date <= maxDate && slotsFor(date).length > 0) return true;
    }
    return false;
  };

  /* ----- Step 1: services ----- */
  const svcList = document.getElementById("svcList");
  const cats = [];
  BOOKING.services.forEach((s) => { if (!cats.includes(s.cat)) cats.push(s.cat); });
  svcList.innerHTML = cats.map((cat) => {
    const items = BOOKING.services
      .map((s, i) => ({ s, i }))
      .filter((x) => x.s.cat === cat)
      .map(({ s, i }) => `
        <button class="svc" type="button" data-svc="${i}">
          <span class="svc__main">
            <span class="svc__name">${s.name}</span>
            ${s.desc ? `<span class="svc__desc">${s.desc}</span>` : ""}
          </span>
          <span class="svc__meta"><span class="svc__price">${s.price}</span><span class="svc__dur">${s.min} min</span></span>
        </button>`).join("");
    return `<div class="svc-cat"><h4 class="svc-cat__title">${cat}</h4>${items}</div>`;
  }).join("");

  svcList.querySelectorAll(".svc").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.service = BOOKING.services[+btn.dataset.svc];
      state.date = null; state.time = null;
      document.getElementById("chosenService").textContent =
        `${state.service.name} · ${state.service.min} min · ${state.service.price}`;
      // open the first month that has availability
      view = new Date(); view.setDate(1);
      let guard = 0;
      while (!monthHasOpen(view) && view < maxDate && guard++ < 14) view.setMonth(view.getMonth() + 1);
      slotsWrap.hidden = true;
      renderCal();
      show(2);
    });
  });

  /* ----- Step 2: calendar + slots ----- */
  let view = new Date(); view.setDate(1);
  const calGrid = document.getElementById("calGrid");
  const calTitle = document.getElementById("calTitle");
  const calPrev = document.getElementById("calPrev");
  const calNext = document.getElementById("calNext");
  const slotsWrap = document.getElementById("slots");
  const slotsGrid = document.getElementById("slotsGrid");
  const slotsLabel = document.getElementById("slotsLabel");

  function renderCal() {
    calTitle.textContent = monthLabel(view);
    const y = view.getFullYear(), m = view.getMonth();
    const first = new Date(y, m, 1).getDay();
    const days = new Date(y, m + 1, 0).getDate();
    let cells = "";
    for (let i = 0; i < first; i++) cells += `<span class="cal__cell is-empty"></span>`;
    for (let d = 1; d <= days; d++) {
      const date = new Date(y, m, d);
      const open = date >= today && date <= maxDate && slotsFor(date).length > 0;
      const sel = state.date && sameDay(date, state.date);
      cells += `<button class="cal__cell${open ? "" : " is-disabled"}${sel ? " is-selected" : ""}" type="button" ${open ? `data-day="${y}-${pad(m + 1)}-${pad(d)}"` : "disabled"}>${d}</button>`;
    }
    calGrid.innerHTML = cells;
    calPrev.disabled = (y === today.getFullYear() && m <= today.getMonth());
    calNext.disabled = new Date(y, m, 1) >= new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
    calGrid.querySelectorAll("[data-day]").forEach((cell) => {
      cell.addEventListener("click", () => {
        const [yy, mm, dd] = cell.dataset.day.split("-").map(Number);
        state.date = new Date(yy, mm - 1, dd);
        state.time = null;
        renderCal();
        renderSlots();
      });
    });
  }

  function renderSlots() {
    const list = slotsFor(state.date);
    slotsLabel.textContent = `Times for ${longDate(state.date)}`;
    slotsGrid.innerHTML = list.map((t) => `<button class="slot" type="button" data-time="${t}">${fmt12(t)}</button>`).join("");
    slotsWrap.hidden = false;
    slotsGrid.querySelectorAll(".slot").forEach((b) => {
      b.addEventListener("click", () => { state.time = b.dataset.time; renderSummary(); show(3); });
    });
    slotsWrap.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  calPrev.addEventListener("click", () => { view.setMonth(view.getMonth() - 1); renderCal(); });
  calNext.addEventListener("click", () => { view.setMonth(view.getMonth() + 1); renderCal(); });

  /* ----- Step 3: summary + submit ----- */
  const summary = document.getElementById("bookSummary");
  function renderSummary() {
    summary.innerHTML = `
      <div class="summary-row"><span>Service</span><strong>${state.service.name}</strong></div>
      <div class="summary-row"><span>Duration</span><strong>${state.service.min} min</strong></div>
      <div class="summary-row"><span>Price</span><strong>${state.service.price}</strong></div>
      <div class="summary-row"><span>Date</span><strong>${longDate(state.date)}</strong></div>
      <div class="summary-row"><span>Time</span><strong>${fmt12(state.time)}</strong></div>`;
  }

  root.querySelectorAll("[data-back]").forEach((b) =>
    b.addEventListener("click", () => show(+b.dataset.back))
  );

  const form = document.getElementById("bookingForm");
  const say = makeSay(document.getElementById("bookingMsg"));
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!state.service || !state.date || !state.time) {
      say("Please pick a service, date, and time first.", "err"); show(1); return;
    }
    const data = new FormData(form);
    const name = (data.get("name") || "").toString().trim();
    const email = (data.get("email") || "").toString().trim();
    if (!name || !email || !EMAIL_RE.test(email)) {
      say("Please add your name and a valid email so I can confirm. 💌", "err"); return;
    }
    data.set("service", state.service.name);
    data.set("duration", `${state.service.min} min`);
    data.set("price", state.service.price);
    data.set("date", longDate(state.date));
    data.set("time", fmt12(state.time));

    const result = await deliverRequest(data, "Appointment request", name, say);
    if (result === "sent") {
      form.reset();
      say(`Requested! I’ll confirm ${longDate(state.date)} at ${fmt12(state.time)} by text or email. 💌`, "ok");
    } else if (result === "mailto") {
      say(`Opening your email — hit send to request ${longDate(state.date)} at ${fmt12(state.time)}. 💌`, "ok");
    }
  });

  renderCal();
}
