# Luv Letter — unified website

A single, refreshed website that brings the artist's two businesses together so
the old Squarespace shop and Acuity scheduling page can both be retired:

- 💅 **The Pressies** — luxury, made-to-order press-on nails (shipped), shown as
  a collectible **postage-stamp sheet** with a "Request your set" postcard form.
- 📅 **The Appointments** — in-person visits booked through an on-site
  **scheduler** (anchored by a wax seal): pick a service → pick a date on the
  calendar → pick an open time slot → enter details. Time slots are generated
  from the artist's hours. It's a request, not an instant booking: a static
  site can't see which slots are already taken, so the artist confirms the time
  by text/email and sends a deposit link to lock it in.

The whole site is built around the brand name being *a love letter*: an opening
note in the hero, postage-stamp press-ons, a wax-seal booking section, and an
**airmail stripe** running along the top and bottom.

It's a plain **static site** — just HTML, CSS, and JS. No build step, no
framework, no server required.

```
index.html          ← the whole page
css/styles.css       ← design system + components
js/main.js           ← nav, scroll reveals, stamp picker, request forms
assets/img/          ← photos (placeholders for now — see assets/README-IMAGES.md)
assets/svg/          ← wax seal
favicon.svg
```

## Run it locally

Any static server works. From this folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

(Or just double-click `index.html` — though the forms behave best over http.)

## ⚙️ Two settings to make it "live"

Both are at the top of **`js/main.js`** in the `CONFIG` object, and they cover
**both** request forms (press-on "Request your set" and the appointment request):

1. **`CONTACT_EMAIL`** — the artist's real inbox. Used by the email links and
   the mailto fallback.

2. **`FORM_ENDPOINT`** — where the forms deliver.
   - Leave it `""` and a form opens a **pre-filled email** to `CONTACT_EMAIL`
     (works everywhere, no signup).
   - To collect submissions online instead, create a **free
     [Formspree](https://formspree.io) form** and paste its endpoint here, e.g.
     `"https://formspree.io/f/abcdwxyz"`. Both forms will post to it, each with
     its own subject line ("Press-on request…" / "Appointment request…").

> Note: this is a request-based flow by design — a pure static site can't show
> real-time availability or take deposits on its own. The artist confirms each
> appointment and sends a deposit/pay link (Venmo/CashApp/Stripe) manually.

## 📅 Editing the scheduler (services + hours)

The booking calendar is driven entirely by the **`BOOKING`** object at the top
of **`js/main.js`** — no other changes needed:

- **`services`** — the list shown in step 1. Edit each entry's `name`, `min`
  (minutes, which sizes the time slots), `price`, `desc`, and `cat` (category
  heading). Add or remove entries freely.
- **`hours`** — weekly availability by weekday (`0`=Sun … `6`=Sat). Each day is
  a list of `["open","close"]` ranges in 24-hour time; an empty `[]` means
  closed. Example: `5: [["10:00","19:00"]]` opens Friday 10am–7pm.
- **`slotMinutes`** — spacing between start times (e.g. 30).
- **`leadHours`** — how far in advance someone must book (e.g. 24).
- **`maxDaysAhead`** — how far out the calendar opens (e.g. 60).

The calendar greys out days with no availability and only offers slots that fit
the selected service's duration within your hours.

## Swap in the real photos

Every image is currently a labeled placeholder. See
**[`assets/README-IMAGES.md`](assets/README-IMAGES.md)** for exactly which file
maps to which slot and the recommended sizes. Drop in the real Instagram photos
(same file names) and they appear automatically.

## Deploy (free)

Pick any one:

- **GitHub Pages** — Settings → Pages → Deploy from a branch → root. No build.
  (Requires a public repo on the free plan.)
- **Netlify** — drag this folder onto <https://app.netlify.com/drop>. Done.
  (Netlify also has built-in form handling if you'd rather not use Formspree.)
- **Vercel / Cloudflare Pages** — import the repo; no build command.

Then connect the artist's domain (e.g. `luvletterpressies.com`) in the host's
dashboard.

## Before launch — client checklist

- [ ] Replace placeholder photos with real Instagram images.
- [ ] Confirm press-on **design names + prices** (in `index.html`, `pressies` section).
- [ ] Confirm booking **services + prices + durations** and **weekly hours**
      (the `BOOKING` object in `js/main.js`).
- [ ] Confirm **shipping turnaround**, **deposit amount**, and
      **appointment/cancellation policies** (FAQ + booking copy).
- [ ] Set `CONTACT_EMAIL` and choose a `FORM_ENDPOINT` (or keep mailto).
