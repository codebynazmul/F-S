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
- [Planned backend (Supabase)](#planned-backend-supabase)
- [Contributing](#contributing)
- [Acknowledgements](#acknowledgements)

---

## What it does

The dashboard is split into tabs. They are listed in the side menu; on phones a bottom bar also gives quick access to **Plan**, **What-If**, **NASA** and **Report**, and **More** opens the full menu.

| Tab | What you can do |
| --- | --- |
| **Crop Rotation Optimizer** | Pick your priorities (save water, improve soil, income, cattle fodder, lower climate risk). Compare up to four rotation strategies against what you grow now, ranked by your priorities. Each strategy shows why it was suggested, its gains and trade-offs, and what to check with your agriculture officer. The evidence used (NASA POWER, SMAP, MODIS, NASADEM, risk levels) and the information gaps are listed. |
| **What-If Climate Simulator** | Change rainfall, temperature and irrigation availability with sliders, or pick a quick scenario (severe drought, heatwave, flood year, normal year), and see how both plans hold up. |
| **Soil & Water Analytics** | Compare water use, nitrogen balance, soil score, drought resilience and crop diversity, plus a 3-year soil organic matter projection. |
| **NASA Earth Data** | Live long-term climate averages for the district from NASA POWER: monthly rainfall, temperature, humidity, solar radiation, root-zone soil wetness and estimated evapotranspiration. |
| **Farm & Soil Profile** | Enter farm size (bigha), soil texture, pH, organic matter and irrigation source. Recommendations update immediately. |
| **Farm Action Dossier** | A printable plan with the crop schedule, water and urea savings, and soil tips. Copy the summary or save it as PDF. |
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

> ⚠️ All of these checks run in the browser and can be bypassed. Replace them with real authentication (NextAuth, Firebase Auth, Supabase, etc.) before storing any real farmer data.

### Admin panel (demo)

Sign in with ID **`admin`** and password **`admin`** (type `admin` in the email field). You go straight to the Admin Panel. A warning stays at the top until you change the default password under **Security**.

| Section | What the admin can do |
| --- | --- |
| **Overview** | Total, active, new, blocked and admin counts; users by division and top districts; most recommended crops; sign-in methods; recent sign-ins. |
| **Users** | Search and filter accounts; edit name and phone; block or unblock; make or remove admins; delete accounts; export the list as CSV. Admins cannot change their own account here. |
| **Activity log** | Every admin sign-in, failed admin sign-in, sign-out and change, newest first (last 500). Filter by type or clear the log. |
| **Security** | Change the signed-in admin's password (minimum 6 characters). |

Promoted admins sign in with their own email and password. **Settings → Clear all saved data** deletes every account and resets the built-in admin password to `admin`.

Because there is no server, the panel only sees accounts used in the same browser, and anyone with developer tools can edit the saved data, including making themselves admin.

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
│   ├── AppProvider.tsx     # Shared app state (user, district, farm, plans)
│   ├── Dashboard.tsx       # Layout and tab switching
│   ├── LoginScreen.tsx     # Phone OTP / Google / email sign-in (demo)

│   ├── ui.tsx              # Shared cards, buttons, input styles
│   ├── admin/              # Admin panel sections (overview, users, activity, security)
│   └── tabs/               # One file per dashboard tab
├── data/
│   ├── crops.ts            # 8 crops: water use, nitrogen, tolerance, Bangla names
│   └── districts.ts        # 64 districts: location, soil, rainfall, temp, risks
├── lib/
│   ├── recommend.ts        # Risk detection, rotation rules, soil tips
│   ├── metrics.ts          # Plan scoring and soil organic matter projection
│   ├── nasaPower.ts        # NASA POWER API hook
│   ├── storage.ts          # localStorage-backed React state
│   ├── auth.ts             # Demo sign-in, password hashing, built-in admin
│   ├── options.ts          # Divisions, soil textures, irrigation types
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

## Planned backend (Supabase)

> **Status: planned, not built yet.** The app currently has no server. This section describes the backend we intend to add to replace demo sign-in, browser-only storage and direct NASA calls from the browser.

**How it works:** NASA APIs → Supabase Edge Functions (fetch, filter, process) → Supabase Postgres (only the observations and predictions the app needs). We never store raw NASA files or responses. The app reads from our database, so it never waits on NASA and keeps working if a NASA service is slow or down.

### Architecture

![Field Shift backend on Supabase](docs/diagrams/supabase-architecture.png)

*Interactive version: [docs/diagrams/supabase-architecture.html](docs/diagrams/supabase-architecture.html)*

### NASA data sources

| API | What we take | Key | How often | Level | Stored as |
|---|---|---|---|---|---|
| [NASA POWER](https://power.larc.nasa.gov/api/temporal/daily/point) | Daily rain, min/max temperature (frost), solar radiation, surface and root-zone wetness; 30-year monthly climatology | None | Daily; climatology yearly | District | `climate_normals`, `observations` |
| [MODIS Web Service (ORNL DAAC)](https://modis.ornl.gov/rst/api/v1/) | NDVI vegetation health (MOD13Q1, 16-day), land surface temperature (MOD11A2, 8-day), evapotranspiration (MOD16A2, 8-day) | None | Weekly | District | `observations` |
| [AppEEARS](https://appeears.earthdatacloud.nasa.gov/api/) | SMAP L4 root-zone and surface soil moisture, NASADEM elevation. *Later:* HLS NDVI and ECOSTRESS evapotranspiration per farm, once the app collects a farm's GPS point | Earthdata Login (free) | SMAP weekly; elevation once | District | `observations` |
| [NASA GIBS (WMTS)](https://gibs.earthdata.nasa.gov/wmts/) | Ready-made satellite map tiles | None | On view | — | **Not stored.** The browser loads tiles directly for the map. |
| [CMR Search](https://cmr.earthdata.nasa.gov/search/) *(later)* | GPM IMERG rainfall, GRACE-FO groundwater | Earthdata Login | Monthly | District | `observations` |

Notes:
- **AppEEARS is asynchronous.** A request becomes a task that can take minutes to hours, so each hourly call of `sync-appeears` first collects finished tasks, then starts new ones when due. One task covers all 64 districts, and the results come back as CSV.
- **CMR returns data files** (HDF5/NetCDF), not values. Processing them is too heavy for Edge Functions, so if we add it, it runs as a separate scheduled worker (for example a Python job on GitHub Actions) that writes the same `observations` rows.
- **Recent NASA data arrives a few days late**, and some values come back as `-999` (missing). The functions skip these.

### Edge Functions

| Function | Runs | What it does |
|---|---|---|
| [`sync-power`](supabase/functions/sync-power/index.ts) | Every 10 min, 00:00–02:59 UTC; each district daily, climatology yearly | Fetches 8 districts per call, drops missing values, computes monthly rain, ET0, 30-day rain against normal, hot days and cold nights |
| [`sync-modis`](supabase/functions/sync-modis/index.ts) | Every 10 min, 03:00–05:59 UTC; each district weekly | Median NDVI, land surface temperature and evapotranspiration in a 5 × 5 km box around each district point |
| [`sync-appeears`](supabase/functions/sync-appeears/index.ts) | Hourly | Collects finished AppEEARS tasks, then submits the weekly SMAP task and the one-time elevation task; task IDs live in `sync_runs` |
| [`predict-risk`](supabase/functions/predict-risk/index.ts) | Daily at 06:15 UTC | Turns the latest observations into drought, flood, heat, cold, salinity and crop-stress levels (simple, documented rules) and writes `predictions` |
| `admin-actions` *(not built yet)* | Called from the admin tab | Checks `role = admin`, then uses the service key to delete users or re-run a sync |

Long jobs process districts in batches (for example 8 per run) so each run stays inside the Edge Function time limit. Progress is recorded in `sync_runs`.

### What we store

| Store | Don't store |
|---|---|
| Processed values, one row per metric per district or farm | Raw NASA JSON, CSV bundles or data files |
| The latest value plus about 12 weeks of history for trend charts; a weekly cleanup deletes older rows | Satellite images and map tiles |
| Climate averages per district (64 rows) | Data for places no farm is in |
| Latest risk predictions per district and farm | Old predictions after they expire |
| Each farmer's saved plan, with a copy of the climate data it used | |

NASA-derived data stays at roughly 10,000 rows (64 districts × about 12 metrics × 12 weeks, plus farm-level rows), no matter how much NASA data exists.

### Tables

![Field Shift database tables](docs/diagrams/supabase-data-model.png)

*Interactive version: [docs/diagrams/supabase-data-model.html](docs/diagrams/supabase-data-model.html)*

| Table | Main columns | Purpose |
|---|---|---|
| `profiles` | id (→ auth.users), name, email, phone, language (en/bn), role (farmer / admin), blocked | User details and roles; a database trigger creates the row at sign-up |
| `farms` | id, user_id, district_id, area, irrigation, soil, lat, lng | Farm profiles |
| `plans` | id, farm_id, plan (jsonb), risks (jsonb), climate_snapshot (jsonb), created_at | Saved rotation plans |
| `districts` | id (e.g. `dhaka`), name, name_bn, division, lat, lng, soil, baseline rainfall and temp, risk, risk_bn | Moved from `data/districts.ts` so admins can edit it |
| `climate_normals` | district_id, monthly_rain_mm[12], monthly_wetness[12], temp_mean, humidity, solar_mj, et0_mm_day, fetched_at | 30-year NASA POWER averages |
| `observations` | id, district_id or farm_id, source (power / modis / smap / hls / ecostress / nasadem), metric, value, observed_at | Processed measurements from every NASA source |
| `predictions` | id, district_id or farm_id, kind (drought / flood / heat / frost / crop_stress), level, valid_until, computed_at | Risk levels from `predict-risk` |
| `sync_runs` | id, job, status, task_id, rows_updated, error, started_at | Sync health and AppEEARS tasks, shown in the admin panel |
| `activity_log` | id, actor_id, action, target, created_at | Admin activity feed (not in the diagram) |

### Access rules (RLS)

- `districts`, `climate_normals`, and district-level `observations` and `predictions`: anyone can read; only Edge Functions (service key) can write.
- `farms`, `plans`, and farm-level `observations` and `predictions`: only the owner (`user_id = auth.uid()`); admins can read all.
- `profiles`: users can edit their own name, phone and language, but **not `role`**. Only `admin-actions` can change roles.
- `activity_log` and `sync_runs`: admins only.
- The admin tab is hidden for non-admins, but that is only cosmetic. The real protection is these rules plus the role check in `admin-actions`.

### Secrets

| Secret | Used by | Where it lives |
|---|---|---|
| `EARTHDATA_USERNAME`, `EARTHDATA_PASSWORD` | `appeears-submit`, `appeears-collect` (and the CMR worker later) | Supabase function secrets: `supabase secrets set ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Functions only | Provided by Supabase inside functions |

POWER, MODIS and GIBS need no key. Never put secrets in a `NEXT_PUBLIC_` variable or commit them to git.

### Database setup

The schema lives in [supabase/migrations/](supabase/migrations/): `20261108120000_init_schema.sql` (tables, access rules, triggers), `20261108120100_seed_districts.sql` (the 64 districts from `data/districts.ts`) `20261108130000_auth_tracking.sql` (sign-in details for the admin panel, activity log rules, blocking) and `20261109090000_farm_sync_and_satellite.sql` (one farm per account, a latest-value view, keeping elevation). Apply them in that order, either by pasting each into the Supabase SQL editor or with `npx supabase db push` after `npx supabase link`.

### Deploying the NASA sync

The four functions are in [supabase/functions/](supabase/functions/). Each is a single file.

1. Set the secrets (pick a long random `CRON_SECRET`; the Earthdata login is your free NASA Earthdata account):
   `npx supabase secrets set CRON_SECRET=<secret> EARTHDATA_USERNAME=<user> EARTHDATA_PASSWORD=<password> --project-ref <ref>`
2. Deploy each with JWT checks off (the functions check `CRON_SECRET` themselves):
   `npx supabase functions deploy sync-power --no-verify-jwt --project-ref <ref>`, then the same for `sync-modis`, `sync-appeears` and `predict-risk`. You can also paste each file into the dashboard's function editor and turn off "Enforce JWT verification".
3. Fill in your project URL and the same `CRON_SECRET` in [supabase/setup/schedule-sync.sql](supabase/setup/schedule-sync.sql) and run it in the SQL editor. It is safe to run again. Don't commit your real values.

The first fill takes a day or two of scheduled runs: NASA POWER finishes the first morning, MODIS over two mornings, and AppEEARS tasks take a few hours. To start sooner, run `select public.call_edge_function('sync-power');` a few times. Check progress with `select job, status, rows_updated, error, started_at from sync_runs order by started_at desc;`.

### Migration from the current code

| Now | After |
|---|---|
| `lib/nasaPower.ts` called NASA POWER from the browser | **Done:** removed. `sync-power` fetches NASA; [lib/climate.ts](lib/climate.ts) reads `climate_normals` and `observations`, and recommendations use NASA rainfall and temperature |
| [lib/recommend.ts](lib/recommend.ts) detects risks and builds plans in the browser | **Done:** current risk levels come from `predict-risk` and show on the NASA and Rotation tabs; the rotation itself is still built in the browser (using NASA climate averages) so it works offline |
| [lib/auth.ts](lib/auth.ts) demo sign-in with a built-in admin | **Done:** Supabase Auth (email, email code, Google) plus `profiles.role` |
| [lib/storage.ts](lib/storage.ts) keeps farms and plans in localStorage | **Done:** [components/useFarmSync.ts](components/useFarmSync.ts) saves the farm to `farms` (one per account) and plan changes to `plans`, keeps localStorage as the offline copy, and uploads offline edits when back online |
| `components/admin/*` reads browser data | Reads users, activity and sync status from Supabase; changes go through `admin-actions` |

### Notes

- **Sign-in:** email (code or magic link) and Google, both free. The phone + SMS login on the current screen will be removed, since SMS costs money per message.
- **Free tier pausing.** Free Supabase projects pause after about a week without visits, and scheduled syncs do not run while paused.

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
