# 📸 Image guide — swapping in the real photos

Right now every photo on the site is a **labeled placeholder** (the dashed pink
boxes). To make the site real, replace the files in `assets/img/` with the
artist's actual Instagram photos — **keep the same file names** and the site
picks them up automatically. No code changes needed.

> Tip: keep file sizes reasonable (under ~400 KB each). Export as `.jpg` for
> photos. If you keep the `.svg` extension on a real photo it won't display —
> either save the photo with the same base name as a `.jpg`/`.png` **and**
> update the `src` in `index.html`, or simply overwrite using an `.svg` is not
> possible. Easiest path: see "Using JPGs" at the bottom.

## What goes where

| File in `assets/img/` | Where it shows | Best size / ratio |
|---|---|---|
| `hero.svg` | Big hero photo (top of page) | Portrait, ~1200 × 1500 (4:5) |
| `stamp-01.svg` … `stamp-08.svg` | The 8 "postage stamp" press-on designs | Portrait, ~600 × 750 (4:5) |
| `gallery-01.svg` … `gallery-06.svg` | The lookbook grid | Square, ~800 × 800 (1:1) |
| `about.svg` | "The artist" portrait | Portrait, ~1000 × 1200 (5:6) |

The press-on **design names and sample prices** live in `index.html` inside the
`<section class="pressies">` block — search for `data-design` and `stamp__name`
to rename a design, and `stamp__price` to change its price.

## Using JPGs (recommended for real photos)

1. Save each real photo with a clear name, e.g. `hero.jpg`, `stamp-01.jpg`.
2. Open `index.html` and change the matching `src` — e.g.
   `assets/img/hero.svg` → `assets/img/hero.jpg`.
3. Use Find & Replace in your editor: replace `hero.svg` with `hero.jpg`,
   `stamp-01.svg` with `stamp-01.jpg`, and so on.

That's it — refresh the page and the real photos appear.
