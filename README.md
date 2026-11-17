# FLARE — 21 days. One receipt.

**Live:** <https://abhijeet-2653.github.io/flare-21/>

A mobile-first 21-day challenge tracker built as a self-contained static web app. No build step, no dependencies — just open it and play.

The art direction is a **riso-print field club**: warm paper stock, hard ink rules, offset print shadows, graph-paper texture, ticket stubs, tally marks and square controls. No glassmorphism, no neon glow, no gradients-as-atmosphere.

## Run it

```powershell
python -m http.server 4173
```

Then open <http://127.0.0.1:4173/>.

You can also open `index.html` directly from disk. Fonts are self-hosted in `assets/fonts/`, so it renders exactly as designed with no network access.

## Deploy

GitHub Pages is configured to build from the `main` branch (branch → root). Every push to `main` republishes the site automatically — there is no build step.

1. Push to `main`.
2. GitHub Pages publishes the repository root.
3. The site is live at <https://abhijeet-2653.github.io/flare-21/>.

Only `index.html`, `favicon.svg`, `css/`, `js/`, and `assets/` are needed at runtime. QA captures in `shots/` are git-ignored and never ship.

Any static host works too — Netlify, Vercel, or Cloudflare Pages need no build command and an output directory of `/`.

## Android app

The same web app also ships as a native Android app via [Capacitor](https://capacitorjs.com/). The web files stay the single source of truth: `scripts/build-www.mjs` assembles them into `www/`, and Capacitor copies that into the Android project. Nothing is maintained twice.

- **Package:** `io.github.abhijeet2653.flare21`
- **Min / target SDK:** 24 / 36
- **Version:** 1.0.0 (`versionCode 1`)
- **Offline:** every asset, fonts included, is bundled — the app needs no network after install.

### Build an APK

You need Node 20+, JDK 21, and the Android SDK with `platforms;android-36` and `build-tools;36.0.0`.

```powershell
npm install
$env:JAVA_HOME   = "C:\path\to\jdk-21"
$env:ANDROID_HOME = "C:\Users\<you>\Android\Sdk"
npm run android:debug
```

The debug APK lands at `android/app/build/outputs/apk/debug/app-debug.apk`. Install it with:

```powershell
adb install -r android\app\build\outputs\apk\debug\app-debug.apk
```

`npm run android:release` builds an app bundle at `android/app/build/outputs/bundle/release/app-release.aab`. Store releases need your own keystore — keep it out of git (`.jks`, `.keystore`, and `keystore.properties` are ignored) and wire it into `android/app/build.gradle`. You can also open the `android/` folder directly in Android Studio and press Run.

### Native behaviour

- **Back button** — `js/native.js` listens for the hardware back gesture and asks the router (`window.FLARE_NATIVE.back()`) to close an overlay, leave a quest, step back through setup, or return home before it exits the app.
- **System bars** — Capacitor's `SystemBars` plugin keeps the app edge-to-edge and exposes `env(safe-area-inset-*)`, so the ink chrome carries light status and navigation icons without overlap.
- **Splash** — a paper-coloured launch screen with the brand mark, handing over to the app theme.
- **Icons** — adaptive icon (paper background, vermilion sun, ink star), themed monochrome icon, plus legacy square and round PNGs, all generated from `resources/*.svg` by `node scripts/render-icons.mjs`.

`www/` and the copied Android web assets are build outputs and git-ignored. After editing `index.html`, `css/`, or `js/`, run `npm run cap:sync` — the `android:*` scripts do it automatically.


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
assets/fonts/         self-hosted Archivo + IBM Plex Mono subsets
css/base.css          tokens, shell, typography, buttons, nav, motion
css/screens.css       welcome + setup wizard + home
css/screens2.css      journey, stats, profile, quest, finale, overlays
css/theme.css         riso-print art-direction layer (loaded last)
js/data.js            challenges, 21 tasks each, custom generator, quotes, badges
js/illustrations.js   Tally the mascot, trophy, "21" orb, squiggle art
js/core.js            state, dates, XP/levels/streaks, icons, confetti, sound, toast
js/screens.js         welcome, setup, home markup
js/screens2.js        journey, stats, you, quest, finale, celebration markup
js/app.js             router, setup flow, timer, hold-to-complete, native back bridge
js/native.js          Capacitor back button wiring (no-op on the web)

capacitor.config.json Capacitor app id, web dir, system bar config
scripts/build-www.mjs assembles www/ from the root static files
scripts/render-icons.mjs  rasterizes resources/*.svg into launcher icons
resources/            launcher icon SVG sources
android/              generated Capacitor Android project (Gradle)
```

## Design notes

- Canvas: warm paper `#F1E8D7` with a faint 26px graph grid and a halftone dot texture.
- Palette: vermilion `#E8451F`, cobalt `#2F49D1`, marigold `#E3A11C`, sage `#5C7F68`, ink `#181510`, cream `#FBF5E8`.
- Type: Archivo (variable, expanded display weights) for headlines and UI, IBM Plex Mono for labels, metadata and stamps.
- Language: flat colour blocks, 1.5–2px ink rules, 3–8px offset print shadows, ticket notches, rotated stamps. No blur, no glass, no glow.
- Icons and illustrations are hand-built inline SVG in two inks, so there are no image assets to load.
- Desktop shows the app inside a 390 × 844 phone frame; below 640 px it becomes a full-screen mobile app.
- `body.reduce` disables animation and confetti when **Reduce motion** is on.
