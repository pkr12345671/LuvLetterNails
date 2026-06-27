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
    // ----- Copycat Sets -----
    { cat: "Copycat Sets", name: "Gel Polish Mani", min: 60, price: "$70", desc: "Dry manicure, shaping & gel polish on natural nails — no extensions. Lasts 4+ weeks." },
    { cat: "Copycat Sets", name: "Structured Mani", min: 120, price: "$90", desc: "Builder-gel structured manicure on natural nails — adds strength, no extensions." },
    { cat: "Copycat Sets", name: "Gel-X", min: 120, price: "$90", desc: "Sleek full set with soft-gel full-cover tips — sturdy yet gentle on your natural nail." },
    { cat: "Copycat Sets", name: "Sculpted", min: 150, price: "$100", desc: "Sculpted full set in builder gel, polygel, or hard gel — for nails needing extra TLC." },

    // ----- LuvLetter Freestylez -----
    { cat: "LuvLetter Freestylez", name: "Design Lvl Freestyle", min: 150, price: "$95", desc: "Gel polish, BIAB, or full set with a freestyle design (non-nail inspo welcome)." },
    { cat: "LuvLetter Freestylez", name: "TrueLuv Freestyle", min: 210, price: "$125", desc: "A true freestyle — you give me full creative control of the design." },
    { cat: "LuvLetter Freestylez", name: "Moodboard Freestyle", min: 240, price: "$150", desc: "Send a Pinterest board, collage, or 4+ pics and I'll design from your moodboard." },
    { cat: "LuvLetter Freestylez", name: "Mystery Mani", min: 180, price: "$115", desc: "Pick your design the fun way — a random design from the gumball machine!" },

    // ----- Special Sets -----
    { cat: "Special Sets", name: "Character Set", min: 210, price: "varies", desc: "Gel polish, BIAB, or full set featuring multiple hand-drawn character designs." },
    { cat: "Special Sets", name: "3D Sculpted Set", min: 270, price: "varies", desc: "Gel polish, BIAB, or full set with complex hand-sculpted 3D designs." },
    { cat: "Special Sets", name: "Nail Date", min: 300, price: "$160", desc: "Bring a bestie or boo! Two guests get sets together — save on your appointment." },

    // ----- Other Services -----
    { cat: "Other Services", name: "Press-Ons Application", min: 60, price: "$10", desc: "Application of a LuvLetter Pressies set — cuticle care, shaping & application." },
    { cat: "Other Services", name: "Press-Ons Sizing", min: 30, price: "$5", desc: "Get sized for press-ons (free if sized during another nail service)." },
    { cat: "Other Services", name: "Design Change", min: 30, price: "$10", desc: "Not feeling your design but too early for a fill? Swap it out." },
    { cat: "Other Services", name: "Removal", min: 30, price: "$5", desc: "Soak-off / removal of my work or another tech's work. Add-ons may apply." },
    { cat: "Other Services", name: "Repair / Replacement", min: 10, price: "varies", desc: "Repair or replacement of broken, chipped, or missing nails." },
  ],

  // Weekly hours by weekday (0=Sun … 6=Sat). Each day is a list of [open, close]
  // ranges in 24h "HH:MM". An empty list means closed that day.
  hours: {
    0: [["11:00", "19:00"]],     // Sunday   11–7
    1: [],                       // Monday   — closed
    2: [["09:00", "21:00"]],     // Tuesday  9–9
    3: [["09:00", "21:00"]],     // Wednesday 9–9
    4: [["09:00", "21:00"]],     // Thursday 9–9
    5: [],                       // Friday   — closed
    6: [["11:00", "19:00"]],     // Saturday 11–7
  },

  slotMinutes: 30,   // spacing between appointment start times
  leadHours: 24,     // earliest you can request from "now"
  maxDaysAhead: 60,  // how far ahead the calendar opens
  deposit: 20,       // non-refundable deposit (shown at confirmation)

  // Add-ons shown in step 2 (after picking a service). Selecting one adjusts the
  // appointment length (min, can be negative) and the price estimate (price, $).
  addons: [
    { group: "Length", name: "XS", price: -5, min: 0 },
    { group: "Length", name: "Short", price: 0, min: 0 },
    { group: "Length", name: "Medium", price: 5, min: 0 },
    { group: "Length", name: "Long", price: 10, min: 0 },
    { group: "Length", name: "XL", price: 20, min: 30 },
    { group: "Length", name: "XXL", price: 25, min: 30 },

    { group: "Nail type", name: "Gel polish", price: -20, min: -30 },
    { group: "Nail type", name: "BIAB", price: 0, min: -30 },
    { group: "Nail type", name: "Gel-X", price: 0, min: 0 },
    { group: "Nail type", name: "Sculpted", price: 10, min: 30 },

    { group: "Design level", name: "Level 1", price: 0, min: 30 },
    { group: "Design level", name: "Level 2", price: 15, min: 60 },
    { group: "Design level", name: "Level 3", price: 30, min: 90 },
    { group: "Design level", name: "Level 4", price: 55, min: 120 },

    { group: "Maintenance", name: "Fill (2–4 wks)", price: -5, min: 0 },
    { group: "Maintenance", name: "Rebalance (5–6 wks)", price: 0, min: 0 },
    { group: "Maintenance", name: "Reshaping", price: 5, min: 0 },
    { group: "Maintenance", name: "Press-ons sizing", price: 0, min: 20 },

    { group: "Removal (my work)", name: "Regularz removal", price: 0, min: 60 },
    { group: "Removal (my work)", name: "Gel polish", price: 5, min: 30 },
    { group: "Removal (my work)", name: "Gel-X / soft gel", price: 5, min: 60 },
    { group: "Removal (my work)", name: "Hard gel / polygel", price: 10, min: 60 },
    { group: "Removal (my work)", name: "Press-ons", price: 5, min: 30 },

    { group: "Removal (other tech)", name: "Gel polish", price: 5, min: 30 },
    { group: "Removal (other tech)", name: "Gel-X / soft gel", price: 10, min: 60 },
    { group: "Removal (other tech)", name: "Hard gel / polygel", price: 15, min: 60 },
    { group: "Removal (other tech)", name: "Acrylic / dip", price: 20, min: 60 },

    { group: "Repair", name: "1 nail", price: 5, min: 15 },
    { group: "Repair", name: "2 nails", price: 10, min: 30 },
    { group: "Repair", name: "3 nails", price: 15, min: 45 },
    { group: "Repair", name: "4 nails", price: 20, min: 60 },

    { group: "Replacement", name: "1 nail", price: 10, min: 15 },
    { group: "Replacement", name: "2 nails", price: 15, min: 30 },
    { group: "Replacement", name: "3 nails", price: 20, min: 45 },
    { group: "Replacement", name: "4 nails", price: 25, min: 60 },

    { group: "Fees", name: "Before/after hours", price: 30, min: 0 },
    { group: "Fees", name: "Late night", price: 15, min: 0 },
    { group: "Fees", name: "Off-day", price: 50, min: 0 },
  ],
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

  const state = { service: null, addons: [], date: null, time: null };
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
  const fmtDur = (m) => { const h = Math.floor(m / 60), mm = m % 60; return h && mm ? `${h} hr ${mm} min` : h ? `${h} hr` : `${mm} min`; };

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today); maxDate.setDate(maxDate.getDate() + BOOKING.maxDaysAhead);

  // appointment length + price include any selected add-ons
  const apptDuration = () => (state.service ? state.service.min : 0) + state.addons.reduce((s, a) => s + a.min, 0);
  const apptAddonPrice = () => state.addons.reduce((s, a) => s + a.price, 0);
  const priceEstimate = () => {
    const base = parseFloat(String(state.service.price).replace(/[^0-9.]/g, ""));
    const addon = apptAddonPrice();
    if (isNaN(base)) return "varies";
    return `~$${base + addon}`;
  };

  const slotsFor = (date) => {
    if (!state.service) return [];
    const ranges = BOOKING.hours[date.getDay()] || [];
    const lead = new Date(Date.now() + BOOKING.leadHours * 3600e3);
    const dur = apptDuration();
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
          <span class="svc__meta"><span class="svc__price">${s.price}</span><span class="svc__dur">${fmtDur(s.min)}</span></span>
        </button>`).join("");
    return `<div class="svc-cat"><h4 class="svc-cat__title">${cat}</h4>${items}</div>`;
  }).join("");

  svcList.querySelectorAll(".svc").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.service = BOOKING.services[+btn.dataset.svc];
      state.addons = []; state.date = null; state.time = null;
      renderAddons();
      updateChosen();
      show(2);
    });
  });

  /* ----- Step 2: add-ons ----- */
  const addonList = document.getElementById("addonList");
  const chosenEls = root.querySelectorAll(".js-chosen");

  const fmtDelta = (a) => {
    const parts = [];
    if (a.price) parts.push(`${a.price > 0 ? "+" : "−"}$${Math.abs(a.price)}`);
    if (a.min) parts.push(`${a.min > 0 ? "+" : "−"}${fmtDur(Math.abs(a.min))}`);
    return parts.join(" · ") || "included";
  };
  const updateChosen = () => {
    if (!state.service) return;
    const est = priceEstimate();
    const txt = `${state.service.name} · ${fmtDur(apptDuration())}${est ? " · " + est : ""}`;
    chosenEls.forEach((el) => (el.textContent = txt));
  };
  function renderAddons() {
    const groups = [];
    BOOKING.addons.forEach((a) => { if (!groups.includes(a.group)) groups.push(a.group); });
    addonList.innerHTML = groups.map((g) => {
      const chips = BOOKING.addons
        .map((a, i) => ({ a, i }))
        .filter((x) => x.a.group === g)
        .map(({ a, i }) => `<button class="addon" type="button" data-addon="${i}"><span class="addon__name">${a.name}</span><span class="addon__delta">${fmtDelta(a)}</span></button>`)
        .join("");
      return `<div class="addon-group"><h5 class="addon-group__title">${g}</h5><div class="addon-group__chips">${chips}</div></div>`;
    }).join("");
    addonList.querySelectorAll(".addon").forEach((btn) => {
      btn.addEventListener("click", () => {
        const a = BOOKING.addons[+btn.dataset.addon];
        const idx = state.addons.indexOf(a);
        if (idx >= 0) { state.addons.splice(idx, 1); btn.classList.remove("is-on"); }
        else { state.addons.push(a); btn.classList.add("is-on"); }
        updateChosen();
      });
    });
  }

  document.getElementById("addonsNext").addEventListener("click", () => {
    state.date = null; state.time = null;
    view = new Date(); view.setDate(1);
    let guard = 0;
    while (!monthHasOpen(view) && view < maxDate && guard++ < 14) view.setMonth(view.getMonth() + 1);
    slotsWrap.hidden = true;
    renderCal();
    show(3);
  });

  /* ----- Step 3: calendar + slots ----- */
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
      b.addEventListener("click", () => { state.time = b.dataset.time; renderSummary(); show(4); });
    });
    slotsWrap.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  calPrev.addEventListener("click", () => { view.setMonth(view.getMonth() - 1); renderCal(); });
  calNext.addEventListener("click", () => { view.setMonth(view.getMonth() + 1); renderCal(); });

  /* ----- Step 4: summary + submit ----- */
  const summary = document.getElementById("bookSummary");
  function renderSummary() {
    const addonRows = state.addons
      .map((a) => `<div class="summary-row summary-row--sub"><span>+ ${a.group}: ${a.name}</span><strong>${fmtDelta(a)}</strong></div>`)
      .join("");
    summary.innerHTML = `
      <div class="summary-row"><span>Service</span><strong>${state.service.name}</strong></div>
      ${addonRows}
      <div class="summary-row"><span>Total time</span><strong>${fmtDur(apptDuration())}</strong></div>
      <div class="summary-row"><span>Est. price</span><strong>${priceEstimate()}</strong></div>
      <div class="summary-row"><span>Date</span><strong>${longDate(state.date)}</strong></div>
      <div class="summary-row"><span>Time</span><strong>${fmt12(state.time)}</strong></div>
      <div class="summary-row summary-row--note"><span>Deposit at booking</span><strong>$${BOOKING.deposit}</strong></div>`;
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
    if (state.addons.length) data.set("addons", state.addons.map((a) => `${a.group}: ${a.name}`).join(", "));
    data.set("duration", fmtDur(apptDuration()));
    data.set("base_price", state.service.price);
    data.set("estimate", priceEstimate());
    data.set("date", longDate(state.date));
    data.set("time", fmt12(state.time));
    data.set("deposit", `$${BOOKING.deposit}`);

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
