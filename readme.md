# Field Shift

**A climate-adaptive crop rotation and soil health planner for Bangladesh.**

Field Shift helps farmers and agricultural officers pick crop rotations that use less water, build soil health, and hold up better under climate stress. It covers all 64 districts of Bangladesh, pulls live climate data from NASA POWER, and works in both English and Bangla.

Built by **SPIDERX** for the NASA Space Apps Challenge.

---

## Contents

- [What it does](#what-it-does)
- [Quick start](#quick-start)
- [Signing in (demo)](#signing-in-demo)
- [First-time setup](#first-time-setup)
- [Install and offline use](#install-and-offline-use)
- [How the recommendations work](#how-the-recommendations-work)
- [Project structure](#project-structure)
- [Data and saved state](#data-and-saved-state)
- [Limitations](#limitations)
- [Tech stack](#tech-stack)
- [Contributing](#contributing)
- [Acknowledgements](#acknowledgements)

---

## What it does

The dashboard is split into tabs. They are listed in the side menu; on phones a bottom bar also gives quick access to **Plan**, **What-If**, **NASA** and **Report**, and **More** opens the full menu.

| Tab | What you can do |
| --- | --- |
| **Crop Rotation Optimizer** | See a recommended 4-season rotation for your district, with the reason for each crop. Compare it against the traditional Boro–Aman rice cycle, and edit either plan. |
| **What-If Climate Simulator** | Change rainfall, temperature and irrigation availability with sliders, or pick a quick scenario (severe drought, heatwave, flood year, normal year), and see how both plans hold up. |
| **Soil & Water Analytics** | Compare water use, nitrogen balance, soil score, drought resilience and crop diversity, plus a 3-year soil organic matter projection. |
| **NASA Earth Data** | Live long-term climate averages for the district from NASA POWER: monthly rainfall, temperature, humidity, solar radiation, root-zone soil wetness and estimated evapotranspiration. |
| **Farm & Soil Profile** | Enter farm size (bigha), soil texture, pH, organic matter and irrigation source. Recommendations update immediately. |
| **Farm Action Dossier** | A printable plan with the crop schedule, water and urea savings, and soil tips. Copy the summary or save it as PDF. |
| **Admin Control & Broadcast** | *(Admins only)* Send drought, salinity, flood or cold-wave advisories to a division. Farmers in that division see them as banners. |
| **My Account / Settings** | Edit your name and phone number (shown on the report), switch between day and night themes, or clear saved data. The English / বাংলা toggle is always in the header. |

---

## Quick start

**Requirements:** Node.js 18 or later, and npm.

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Serve the production build |
| `npm run lint` | Run Next.js lint checks (see note below) |

> **Note:** ESLint is not set up in this repo yet (no `eslint` dependency or config). The first `npm run lint` will ask you to choose a config and install ESLint.

No environment variables or API keys are needed. The NASA POWER API is public and is called straight from the browser, so the NASA Earth Data tab needs an internet connection.

---

## Signing in (demo)

There is no backend yet, so sign-in is simulated in the browser:

- **Phone + OTP** — enter a Bangladeshi mobile number (e.g. `1712345678`). No SMS is sent; the 6-digit code is shown on screen.
- **Google** — signs you in as a demo farmer. No real OAuth takes place.
- **Email + password** — any valid email with any password signs you in as a farmer. The demo admin account (`spiderx@gmail.com`) needs the admin password; ask the project owner for it. Only its SHA-256 hash is stored in [lib/auth.ts](lib/auth.ts).

Admins go straight to the Admin tab. Everyone else goes through first-time setup.

> ⚠️ All of these checks run in the browser and can be bypassed. Replace them with real authentication (NextAuth, Firebase Auth, Supabase, etc.) before storing any real farmer data.

---

## First-time setup

After a farmer signs in for the first time, a short three-step setup asks for:

1. **District** — pick from the list, or tap *Use my location* to choose the nearest district by GPS.
2. **Soil texture** — with plain-language hints (e.g. "sticky when wet, cracks when dry").
3. **Water source and farm size** — irrigation type and farm size in bigha.

It can be skipped, and every value can be changed later in **Farm & Soil Profile**. Setup is shown once per browser.

---

## Install and offline use

Field Shift is a Progressive Web App:

- [app/manifest.ts](app/manifest.ts) provides the web app manifest, so it can be installed to a phone's home screen.
- [public/sw.js](public/sw.js) is a service worker that keeps pages, built files and images in a cache, so the app still opens without a connection. NASA POWER answers are cached too: a saved answer is shown at once and refreshed in the background.
- The service worker is registered only in production builds (`npm run build && npm run start`), not under `npm run dev`. To drop old caches after a big change, bump `VERSION` in `public/sw.js`.

---

## How the recommendations work

Recommendations come from simple, readable rules rather than a trained model, so they are easy to check and adjust.

**1. Risk detection** — [lib/recommend.ts](lib/recommend.ts)
Each district has rainfall, temperature and a written risk description. From these and the farm profile, the app flags **drought**, **salinity**, **flood**, **cold** and **heat** risk. For example, rainfall under 1600 mm or a rainfed farm counts as drought risk.

**2. Rotation rules** — [lib/recommend.ts](lib/recommend.ts)

| Season | Default | Changes when… |
| --- | --- | --- |
| 1 · Winter | Mustard | Wheat in cold, non-saline districts |
| 2 · Winter/Spring | Lentil | Salt-tolerant wheat if saline (and season 1 isn't already wheat); otherwise chickpea if drought or heat. In flood-prone districts lentil stays, because it is harvested before early floods. |
| 3 · Monsoon | Ropa Aman rice | — |
| 4 · Summer | Mungbean | Hybrid maize if there is no major risk, tube-well irrigation, and organic matter ≥ 1.5% |

**3. Scoring** — [lib/metrics.ts](lib/metrics.ts)
Each plan is scored for total water demand, net nitrogen, soil score (0–100), water stress, yield resilience and crop-family diversity. Soil texture and irrigation source adjust water demand and supply. In the simulator, the rainfall, temperature and irrigation sliders are applied on top.

This is a screening model for **comparing plans**, not a crop growth model. Treat the numbers as relative, not as yield forecasts.

**4. NASA POWER** — [lib/nasaPower.ts](lib/nasaPower.ts)
Fetches climatology (`PRECTOTCORR`, `T2M`, `RH2M`, `ALLSKY_SFC_SW_DWN`, `GWETROOT`) for the district's coordinates. Reference evapotranspiration is estimated with the Hargreaves radiation formula. Results are cached per location while the app is open (and by the service worker across visits in production). If the request fails, the tab falls back to the district's baseline figures and offers a retry.

---

## Project structure

```text
.
├── app/
│   ├── layout.tsx          # HTML shell, metadata, fonts, theme set before first paint
│   ├── page.tsx            # Login screen → first-time setup → dashboard
│   ├── manifest.ts         # PWA manifest (name, colours, icons)
│   ├── not-found.tsx
│   └── globals.css
├── components/
│   ├── AppProvider.tsx     # Shared app state (user, district, farm, plans, alerts)
│   ├── Dashboard.tsx       # Layout and tab switching
│   ├── LoginScreen.tsx     # Phone OTP / Google / email sign-in (demo)
│   ├── Onboarding.tsx      # Three-step first-time farm setup
│   ├── Sidebar.tsx         # Main navigation menu
│   ├── BottomNav.tsx       # Bottom tab bar on phones and small tablets
│   ├── TopBar.tsx          # District picker, language toggle, alert banners
│   ├── CropIcon.tsx        # Drawn crop icons and the crop picker
│   ├── ServiceWorker.tsx   # Registers public/sw.js in production
│   ├── ui.tsx              # Shared cards, buttons, input styles
│   └── tabs/               # One file per dashboard tab
├── data/
│   ├── crops.ts            # 8 crops: water use, nitrogen, tolerance, Bangla names
│   └── districts.ts        # 64 districts: location, soil, rainfall, temp, risks
├── lib/
│   ├── recommend.ts        # Risk detection, rotation rules, soil tips
│   ├── metrics.ts          # Plan scoring and soil organic matter projection
│   ├── nasaPower.ts        # NASA POWER API hook
│   ├── storage.ts          # localStorage-backed React state
│   ├── auth.ts             # Demo sign-in helpers
│   ├── options.ts          # Divisions, soil textures, irrigation types, alert types
│   ├── i18n.ts             # English / Bangla helpers
│   └── types.ts
├── public/
│   ├── sw.js               # Service worker (offline cache)
│   ├── logo.png, logo-sm.png
│   ├── icon-*.png, apple-touch-icon.png   # App icons
│   └── login-bg.mp4, login-bg.jpg         # Login screen background
└── global.d.ts             # Lets TypeScript accept CSS imports
```

The `@/` import alias points to the project root.

---

## Data and saved state

- **Crops** — rice (Boro and Aman), wheat, lentil, chickpea, mustard, maize and mungbean, in [data/crops.ts](data/crops.ts). To add a crop, add an entry to `CROP_DATABASE` and it becomes available in the plan editors. Optionally add a drawn icon for it in [components/CropIcon.tsx](components/CropIcon.tsx); without one it shows a plain tile. The automatic recommendation only uses the rules above, so a new crop is not recommended until you add a rule for it.
- **Districts** — all 64 districts in [data/districts.ts](data/districts.ts), with coordinates used for the NASA POWER lookups.
- **Saved state** — everything (user, language, theme, selected district and tab, farm profile, edited plans, admin alerts, dismissed alerts, whether setup is done) is kept in the browser's `localStorage` under keys starting with `fs-`. It is not shared between browsers or devices. **Settings → Clear all saved data** removes it and signs you out.

Because alerts are stored per browser, an admin broadcast is only visible in the same browser that sent it. A shared backend is needed for it to reach other users.

---

## Limitations

- Sign-in and OTP are demo-only (see above).
- No backend or database; all data lives in the browser.
- SMAP soil moisture and ECOSTRESS evapotranspiration are not connected yet (they need a NASA Earthdata account). Only NASA POWER is live.
- District baselines in `data/districts.ts` are static values, separate from the live NASA POWER figures.
- The scoring model is a simplified comparison tool and has not been validated against field data.

---

## Tech stack

- [Next.js 14](https://nextjs.org/) (App Router) and React 18
- TypeScript
- Tailwind CSS
- Inter and Noto Sans Bengali fonts via `next/font`
- [lucide-react](https://lucide.dev/) icons
- [NASA POWER API](https://power.larc.nasa.gov/)

---

## Contributing

1. Create a branch from `main`.
2. Run `npm run lint` and `npm run build` before opening a pull request.
3. Add every user-facing string in both languages, using `t('English', 'বাংলা')` from `useApp()`.

---

## License

No license has been chosen yet, so all rights are reserved by the repository owner. Add a `LICENSE` file to allow reuse.

## Acknowledgements

- [NASA Space Apps Challenge](https://www.spaceappschallenge.org/)
- NASA Langley Research Center [POWER Project](https://power.larc.nasa.gov/) for climate data
