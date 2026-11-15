# FLARE — 21 days. One receipt.

**Live:** <https://abhijeet-2653.github.io/flare-21/>

A mobile-first 21-day challenge tracker built as a self-contained static web app. No build step, no dependencies — just open it and play.

The art direction is a **riso-print field club**: warm paper stock, hard ink rules, offset print shadows, graph-paper texture, ticket stubs, tally marks and square controls. No glassmorphism, no neon glow, no gradients-as-atmosphere.

## Run it

```powershell
python -m http.server 4173
```

Then open <http://127.0.0.1:4173/>.

You can also open `index.html` directly, though the Google Fonts need network access to render as designed.

## Deploy

GitHub Pages is configured to build from the `main` branch (branch → root). Every push to `main` republishes the site automatically — there is no build step.

1. Push to `main`.
2. GitHub Pages publishes the repository root.
3. The site is live at <https://abhijeet-2653.github.io/flare-21/>.

Only `index.html`, `favicon.svg`, `css/`, and `js/` are needed at runtime. QA captures in `shots/` are git-ignored and never ship.

Any static host works too — Netlify, Vercel, or Cloudflare Pages need no build command and an output directory of `/`.


## What's inside

- **Goal setup wizard** — pick Move, Mind, Make, Unplug, or write your own challenge; set a daily dose, ritual time, name, and reminder.
- **Today dashboard** — streak, XP, level, progress ring, today's quest, weekly strip, and a daily quote.
- **Quest detail** — three-step plan, live focus timer, a note field, and a hold-to-complete interaction (hold for one second) with confetti and a completion overlay.
- **Journey** — all 21 days, with done / today / missed / locked states, week milestones, and bonus XP.
- **Receipts** — progress ring, XP tiles, weekly bars, a 21-day heat map, and unlockable stamps.
- **You** — profile, level progress, sound/motion/reminder toggles, goal reset, and demo controls.
- **Finale** — a day-21 story card, stats recap, and preview mode.
- **Demo mode** — seeds five days of history, one missed day, and lands on day 6 so every screen has something to show.

Everything persists to `localStorage` under `flare21.v1`.

## Play with the demo

The welcome screen's **Peek a demo** button seeds the demo state. From **You → Skip to next day**, you can fast-forward the calendar without waiting three weeks.

## Project map

```
index.html            app shell, device frame, script order
favicon.svg           paper / ink / vermilion print mark
css/base.css          tokens, shell, typography, buttons, nav, motion
css/screens.css       welcome + setup wizard + home
css/screens2.css      journey, stats, profile, quest, finale, overlays
css/theme.css         riso-print art-direction layer (loaded last)
js/data.js            challenges, 21 tasks each, custom generator, quotes, badges
js/illustrations.js   Tally the mascot, trophy, "21" orb, squiggle art
js/core.js            state, dates, XP/levels/streaks, icons, confetti, sound, toast
js/screens.js         welcome, setup, home markup
js/screens2.js        journey, stats, you, quest, finale, celebration markup
js/app.js             router, setup flow, timer, hold-to-complete, demo controls
```

## Design notes

- Canvas: warm paper `#F1E8D7` with a faint 26px graph grid and a halftone dot texture.
- Palette: vermilion `#E8451F`, cobalt `#2F49D1`, marigold `#E3A11C`, sage `#5C7F68`, ink `#181510`, cream `#FBF5E8`.
- Type: Archivo (variable, expanded display weights) for headlines and UI, IBM Plex Mono for labels, metadata and stamps.
- Language: flat colour blocks, 1.5–2px ink rules, 3–8px offset print shadows, ticket notches, rotated stamps. No blur, no glass, no glow.
- Icons and illustrations are hand-built inline SVG in two inks, so there are no image assets to load.
- Desktop shows the app inside a 390 × 844 phone frame; below 640 px it becomes a full-screen mobile app.
- `body.reduce` disables animation and confetti when **Reduce motion** is on.
