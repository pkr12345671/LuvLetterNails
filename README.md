# Luv Letter — unified website

A single, refreshed website that brings the artist's two businesses together:

- 💅 **The Pressies** — luxury, made-to-order press-on nails (shipped), shown as
  a collectible **postage-stamp sheet** with a "Request your set" postcard form.
- 📅 **The Appointments** — in-person bookings via the existing **Acuity**
  scheduler, embedded right on the page (anchored by a wax seal).

The whole site is built around the brand name being *a love letter*: an opening
note in the hero, postage-stamp press-ons, a wax-seal booking section, and an
**airmail stripe** running along the top and bottom.

It's a plain **static site** — just HTML, CSS, and JS. No build step, no
framework, no server required.

```
index.html          ← the whole page
css/styles.css       ← design system + components
js/main.js           ← nav, scroll reveals, stamp picker, form, Acuity embed
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

(Or just double-click `index.html` — though the Acuity embed and form behave
best when served over http.)

## ⚙️ Two settings to make it "live"

Both are at the top of **`js/main.js`** in the `CONFIG` object:

1. **`ACUITY_URL`** — the artist's Acuity booking link. Already set to
   `https://luvletternails.as.me/schedule/ea9af220`. Change it here if it ever
   updates. *(Optional: in Acuity → Customize Appearance you can copy a full
   embed snippet and paste it inside `<div id="acuityEmbed">` in `index.html`;
   the script will leave your snippet in place.)*

2. **`FORM_ENDPOINT`** — where the "Request your set" form delivers.
   - Leave it `""` and the form opens a **pre-filled email** to `CONTACT_EMAIL`
     (works everywhere, no signup).
   - To collect submissions online instead, create a **free
     [Formspree](https://formspree.io) form** and paste its endpoint here, e.g.
     `"https://formspree.io/f/abcdwxyz"`.

   Also update **`CONTACT_EMAIL`** to the artist's real inbox.

## Swap in the real photos

Every image is currently a labeled placeholder. See
**[`assets/README-IMAGES.md`](assets/README-IMAGES.md)** for exactly which file
maps to which slot and the recommended sizes. Drop in the real Instagram photos
(same file names) and they appear automatically.

## Deploy (free)

Pick any one:

- **Netlify** — drag this folder onto <https://app.netlify.com/drop>. Done.
  (Netlify also has built-in form handling if you'd rather not use Formspree.)
- **Vercel** — `vercel` in this folder, or import the repo.
- **Cloudflare Pages / GitHub Pages** — point it at this repo; no build command.

Then connect the artist's domain (e.g. `luvletterpressies.com`) in the host's
dashboard.

## Before launch — client checklist

- [ ] Replace placeholder photos with real Instagram images.
- [ ] Confirm press-on **design names + prices** (in `index.html`, `pressies` section).
- [ ] Confirm **shipping turnaround** and **appointment/cancellation policies**
      (FAQ section + Acuity).
- [ ] Set `CONTACT_EMAIL` and choose a `FORM_ENDPOINT` (or keep mailto).
- [ ] Confirm the Acuity link / paste the official embed snippet.
