# Luv Letter — unified website

A single, refreshed website that brings the artist's two businesses together so
the old Squarespace shop and Acuity scheduling page can both be retired:

- 💅 **The Pressies** — luxury, made-to-order press-on nails (shipped), shown as
  a collectible **postage-stamp sheet** with a "Request your set" postcard form.
- 📅 **The Appointments** — in-person visits booked through the artist's real
  **Acuity scheduler, embedded** right in the page (anchored by a wax seal).
  Acuity handles live availability, no double-booking, client accounts, and
  reminders; connected to **Square**, it collects the **$20 deposit**.

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

## ⚙️ Settings (top of `js/main.js`, the `CONFIG` object)

- **`ACUITY_URL`** — the artist's Acuity scheduler link (the Book section embeds
  it). Already set to her existing page. *Best practice:* in Acuity →
  **Customize Appearance → Scheduling Page Link & Embed Code**, copy the official
  **embed `<iframe>`** and paste it inside `<div id="acuityEmbed">` in
  `index.html`; if an iframe is already there, the script leaves it alone.
- **`SQUARE_PRESSIES_URL`** — her Square store / checkout / payment link for
  press-on orders. Leave `""` to hide the Square button; set it to show a
  "Shop & pay on Square" button in the press-on section.
- **`CONTACT_EMAIL`** — inbox for the press-on request email + mailto links.
- **`FORM_ENDPOINT`** — where the press-on "Request your set" form delivers.
  Leave `""` for a pre-filled email, or paste a free
  [Formspree](https://formspree.io) endpoint to collect submissions online.

### Live availability + the $20 deposit (done in her accounts, not code)
The booking calendar, availability, client accounts, reminders, and deposit are
all handled by **Acuity + Square** — nothing to run or maintain here:
1. In **Acuity → Integrations**, connect her **Square** account.
2. On each appointment type in Acuity, set the **$20 deposit** so the embedded
   scheduler collects it through Square at booking.
3. Edit services, prices, durations, hours, and add-ons **in Acuity** (they show
   up automatically in the embed).

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
- [ ] In **Acuity**, connect **Square** and set the **$20 deposit** on appointment
      types; paste her official Acuity embed into `#acuityEmbed` (or keep `ACUITY_URL`).
- [ ] Set **`SQUARE_PRESSIES_URL`** to her Square store/checkout for press-ons.
- [ ] Confirm **shipping turnaround** and **policies** (FAQ + booking copy).
- [ ] Set `CONTACT_EMAIL` and choose a `FORM_ENDPOINT` (or keep mailto).
