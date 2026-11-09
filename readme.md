<p align="center">
  <img src="public/logo.png" alt="Field Shift logo" width="160" />
</p>

<h1 align="center">Field Shift</h1>

<p align="center">
  <strong>A climate-adaptive crop rotation and soil health planner for Bangladesh.</strong>
</p>

<p align="center">
  <a href="https://www.spaceappschallenge.org/"><img src="https://img.shields.io/badge/NASA_Space_Apps-Challenge-0B3D91?style=for-the-badge&logo=nasa&logoColor=white" alt="NASA Space Apps Challenge" /></a>
  <img src="https://img.shields.io/badge/Team-SPIDERX-2E7D32?style=for-the-badge" alt="Team SPIDERX" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js 14" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Supabase-Postgres_%7C_Auth_%7C_Edge-3FCF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/PWA-offline_ready-5A0FC8?style=flat-square&logo=pwa&logoColor=white" alt="PWA" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Data-NASA_POWER_%7C_MODIS_%7C_SMAP_%7C_NASADEM-0B3D91?style=flat-square" alt="NASA data sources" />
  <img src="https://img.shields.io/badge/Coverage-64_districts-2E7D32?style=flat-square" alt="64 districts" />
  <img src="https://img.shields.io/badge/Language-English_%7C_%E0%A6%AC%E0%A6%BE%E0%A6%82%E0%A6%B2%E0%A6%BE-F57C00?style=flat-square" alt="English and Bangla" />
</p>

---

Field Shift helps farmers and agricultural officers pick crop rotations that use less water, build soil health, and hold up better under climate stress. It covers all 64 districts of Bangladesh, uses NASA climate and satellite data (POWER, MODIS, SMAP and NASADEM), and works in both English and Bangla.

Built by **SPIDERX** for the NASA Space Apps Challenge.

---

## Contents

- [What it does](#what-it-does)
- [Quick start](#quick-start)
- [Signing in](#signing-in)
- [First-time setup](#first-time-setup)
- [Install and offline use](#install-and-offline-use)
- [How the recommendations work](#how-the-recommendations-work)
- [Project structure](#project-structure)
- [Data and saved state](#data-and-saved-state)
- [Backend (Supabase)](#backend-supabase)
- [Limitations](#limitations)
- [Tech stack](#tech-stack)
- [Contributing](#contributing)
- [Acknowledgements](#acknowledgements)

---

## What it does

The dashboard is split into tabs. They are listed in the side menu; on phones a bottom bar also gives quick access to **Plan**, **What-If**, **NASA** and **Report**, and **More** opens the full menu.

| Tab | What you can do |
| --- | --- |
| **Crop Rotation Optimizer** | Pick your priorities (save water, improve soil, more income, cattle fodder, lower climate risk). Compare up to four rotation strategies against what you grow now, ranked by how well they fit your priorities. Each strategy shows why it was suggested, its gains and trade-offs, and what to check with your agriculture officer. The evidence behind the advice (NASA POWER, SMAP, MODIS, NASADEM, current risk levels) and the information gaps are listed. |
| **What-If Climate Simulator** | Change rainfall, temperature and irrigation availability with sliders, or pick a quick scenario (severe drought, heatwave, flood year, normal year), and see how both plans hold up. |
| **Soil & Water Analytics** | Compare water use, nitrogen balance, soil score, drought resilience and crop diversity, plus a 3-year soil organic matter projection. |
| **NASA Earth Data** | 30-year NASA POWER averages for the district (monthly rainfall, temperature, humidity, solar radiation, root-zone soil wetness, estimated crop water demand), the last 30 days against normal (rain, hot days, cold nights), a satellite view (MODIS vegetation health and land temperature, SMAP soil moisture, NASADEM elevation) and current risk levels. |
| **Farm & Soil Profile** | Enter farm size (bigha), soil texture, pH, organic matter and irrigation source. Recommendations update immediately. |
| **Farm Action Dossier** | A printable plan with the crop schedule, water and urea savings, and soil tips. Copy the summary or save it as PDF. |
| **Account** | Edit your name and phone number, see whether your farm and plan are saved to your account, and sign out. |
| **Settings** | Day or night theme, English or Bangla, and clearing the data saved on this device. |
| **Admin Panel** | Admins only. See [Admin panel](#admin-panel). |

---

## Quick start

**Requirements:** Node.js 18 or later, npm, and a [Supabase](https://supabase.com/) project (the free tier is enough).

1. Install packages:

   ```bash
   npm install
   ```

2. Create `.env.local` in the project root with your Supabase project's URL and publishable (anon) key, from **Project Settings → API**:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-or-anon-key>
   ```

   The app will not start without these. The publishable key is safe in the browser; row-level security in the database decides what each user can see.

3. Set up the database by applying the migrations (see [Database setup](#database-setup)).

4. Start the app:

   ```bash
   npm run dev
   ```

   Open <http://localhost:3000>.

NASA data appears once the sync functions have run (see [Deploying the NASA sync](#deploying-the-nasa-sync)). Until then the NASA tab and the recommendations fall back to the district baselines in `data/districts.ts`.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Serve the production build |
| `npm run lint` | Run Next.js lint checks (see note below) |

> **Note:** ESLint is not set up in this repo yet (no `eslint` dependency or config). The first `npm run lint` will ask you to choose a config and install ESLint.

---

## Signing in

Sign-in uses Supabase Auth. Farmers can:

- **Continue with Google**
- **Email and password** — new accounts get a confirmation link by email.
- **Email code** — a one-time code (or magic link) sent by email, no password needed.

For Google sign-in, turn on the Google provider in your Supabase project (**Authentication → Providers**) and add your site URL (e.g. `http://localhost:3000`) to the allowed redirect URLs.

A `profiles` row is created automatically for every new account, with the role `farmer`. Blocked users are signed out straight away.

### Admin panel

There is no built-in admin account. To make the first admin, sign up normally, then run this in the Supabase SQL editor:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

After that, admins can promote other users from the panel.

| Section | What the admin can do |
| --- | --- |
| **Overview** | Total, active, new, blocked and admin counts; users by division and top districts; most recommended crops; sign-in methods; recent sign-ins. |
| **Users** | Search and filter accounts; edit name and phone; block or unblock; make or remove admins; export the list as CSV. Admins cannot change their own account here. Deleting accounts needs the planned `admin-actions` function and is not available yet. |
| **Activity log** | Admin actions (edits, blocks, role changes, exports, password changes), newest first. Filter by type or clear the log. |
| **Security** | Change the signed-in admin's password (minimum 6 characters). |

The admin tab is hidden for non-admins, but the real protection is in the database: row-level security and a trigger stop non-admins from changing their own role, blocked status or sign-in details.

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
- [public/sw.js](public/sw.js) is a service worker that caches pages, built files, fonts and images, so the app still opens without a connection. It does not touch Supabase requests.
- The app keeps its own offline copy of the last NASA data it loaded, and of the farm profile and plans. Farm and plan edits made offline are uploaded when the connection returns.
- The service worker is registered only in production builds (`npm run build && npm run start`), not under `npm run dev`. To drop old caches after a big change, bump `VERSION` in `public/sw.js`.

---

## How the recommendations work

Recommendations come from simple, readable rules rather than a trained model, so they are easy to check and adjust. All of it lives in [lib/recommend.ts](lib/recommend.ts) and [lib/metrics.ts](lib/metrics.ts).

**1. Reading the conditions** — `assessConditions()`
The app collects evidence from every source it has and flags **drought**, **salinity**, **flood**, **cold**, **heat** and **crop stress** risk. Each fact is kept and shown to the farmer, with the risks it raised.

| Source | Rule (examples) |
| --- | --- |
| District profile | Keywords in the known local hazard (e.g. "saline", "haor", "groundwater") |
| NASA POWER averages | Rainfall under 1,600 mm → drought; mean temperature under 25 °C → cold; 26.7 °C or more → heat |
| NASA POWER, last 30 days | Rain 50% below normal → drought, 60% above → flood; 5+ days at 35 °C → heat; 5+ nights under 10 °C → cold |
| SMAP soil moisture | Root zone under 0.15 m³/m³ → drought; over 0.42 → flood |
| MODIS | Land surface temperature 40 °C or more → heat; NDVI under 0.3 → crop stress |
| NASADEM | Elevation under 5 m → flood |
| Server risk levels | Any medium or high level from `predict-risk` |
| Farm profile | Rain-fed farm → drought |

The app also lists what it cannot see, such as missing satellite data or a farm that still uses the default pH and organic matter values.

**2. Building strategies**

| Strategy | Rotation | Shown when |
| --- | --- | --- |
| **Climate-adaptive** | One crop per season chosen for the risks (rules below) | Always |
| **Small step** | Mustard – Boro – Aman – Mungbean | Always |
| **Income & fodder** | Maize – Lentil – Aman – Mungbean | No flood or salinity risk, and the farm is irrigated |
| **Water & soil saver** | Chickpea/Lentil – Lentil/Chickpea – Aman – Mungbean | No flood or salinity risk |

Strategies with the same crops as one already listed, or as the current practice, are dropped. The climate-adaptive rules:

| Season | Default | Changes when… |
| --- | --- | --- |
| 1 · Winter | Mustard | Wheat in cold, non-saline districts |
| 2 · Winter/Spring | Lentil | Salt-tolerant wheat if saline (and season 1 isn't already wheat); otherwise chickpea if drought or heat without flood. In flood-prone districts lentil stays, because it is harvested before early floods. |
| 3 · Monsoon | Ropa Aman rice | — |
| 4 · Summer | Mungbean | Hybrid maize if there is no drought, salinity or flood risk, tube-well irrigation, and organic matter ≥ 1.5% |

**3. Scoring and ranking**
Each plan is scored for water demand, net nitrogen, soil score (0–100), water stress, yield resilience, crop-family diversity, income and fodder value. Soil texture and irrigation source adjust water demand and supply; in the simulator, the rainfall, temperature and irrigation sliders are applied on top.

Each strategy gets a 0–100 match score: the farmer's chosen priorities count three times as much as the others, and every crop that is a poor fit for the local risks takes off 8 points. Strategies are listed best match first.

This is a screening model for **comparing plans**, not a crop growth model. Treat the numbers as relative, not as yield forecasts.

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
│   ├── AppProvider.tsx     # Shared app state (session, profile, district, farm, plans, NASA data, admin actions)
│   ├── useFarmSync.ts      # Saves the farm and plans to Supabase, with an offline copy
│   ├── Dashboard.tsx       # Layout and tab switching
│   ├── LoginScreen.tsx     # Google / email + password / email code sign-in
│   ├── Onboarding.tsx      # First-time setup
│   ├── Sidebar.tsx, TopBar.tsx, BottomNav.tsx
│   ├── ui.tsx              # Shared cards, buttons, input styles
│   ├── admin/              # Admin panel sections (overview, users, activity, security)
│   └── tabs/               # One file per dashboard tab
├── data/
│   ├── crops.ts            # 8 crops: water use, nitrogen, tolerance, income, fodder, Bangla names
│   └── districts.ts        # 64 districts: location, soil, baseline rainfall and temp, risks
├── lib/
│   ├── supabase.ts         # Supabase client
│   ├── climate.ts          # Reads NASA averages, latest observations and risk levels from Supabase
│   ├── recommend.ts        # Evidence, risk detection, strategies, ranking, soil tips
│   ├── metrics.ts          # Plan scoring and soil organic matter projection
│   ├── storage.ts          # localStorage-backed React state
│   ├── auth.ts             # Profile → user helpers, validation
│   ├── options.ts          # Divisions, soil textures, irrigation types, priorities, default farm
│   ├── i18n.ts             # English / Bangla helpers
│   └── types.ts
├── supabase/
│   ├── migrations/         # Database schema, seed data, access rules
│   ├── functions/          # Edge Functions: sync-power, sync-modis, sync-appeears, predict-risk
│   └── setup/              # schedule-sync.sql (cron jobs for the functions)
├── docs/diagrams/          # Backend architecture and data model diagrams
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

- **Crops** — rice (Boro and Aman), wheat, lentil, chickpea, mustard, maize and mungbean, in [data/crops.ts](data/crops.ts). To add a crop, add an entry to `CROP_DATABASE` (including `incomeScore` and `forageScore`) and it becomes available in the plan editors. Optionally add a drawn icon for it in [components/CropIcon.tsx](components/CropIcon.tsx); without one it shows a plain tile. The recommendations only use the rules above, so a new crop is not suggested until you add it to a strategy.
- **Districts** — all 64 districts in [data/districts.ts](data/districts.ts), with coordinates and baseline climate. The same list is seeded into the `districts` table for the NASA sync.
- **Your account** — profile, farm (one per account) and plans are stored in Supabase. Language, theme, the selected tab and an offline copy of the farm and NASA data are kept in the browser. **Settings → Clear all saved data** only clears this device; it does not delete anything from your account.

---

## Backend (Supabase)

**How it works:** NASA APIs → Supabase Edge Functions (fetch, filter, process) → Supabase Postgres (only the values the app needs). We never store raw NASA files or responses. The app reads from our database, so it never waits on NASA and keeps working if a NASA service is slow or down.

### Architecture

![Field Shift backend on Supabase](docs/diagrams/supabase-architecture.png)

*Interactive version: [docs/diagrams/supabase-architecture.html](docs/diagrams/supabase-architecture.html)*

### NASA data sources

| API | What we take | Key | How often | Level | Stored as |
|---|---|---|---|---|---|
| [NASA POWER](https://power.larc.nasa.gov/api/temporal/daily/point) | Daily rain, min/max temperature, solar radiation, surface and root-zone wetness; 30-year monthly climatology | None | Daily; climatology yearly | District | `climate_normals`, `observations` |
| [MODIS Web Service (ORNL DAAC)](https://modis.ornl.gov/rst/api/v1/) | NDVI vegetation health (MOD13Q1, 16-day), land surface temperature (MOD11A2, 8-day), evapotranspiration (MOD16A2, 8-day) | None | Weekly | District | `observations` |
| [AppEEARS](https://appeears.earthdatacloud.nasa.gov/api/) | SMAP L4 root-zone and surface soil moisture, NASADEM elevation | Earthdata Login (free) | SMAP weekly; elevation once | District | `observations` |

Notes:
- **AppEEARS is asynchronous.** A request becomes a task that can take minutes to hours, so each hourly call of `sync-appeears` first collects finished tasks, then starts new ones when due. One task covers all 64 districts, and the results come back as CSV.
- **Recent NASA data arrives a few days late**, and some values come back as `-999` (missing). The functions skip these.

### Edge Functions

| Function | Runs | What it does |
|---|---|---|
| [`sync-power`](supabase/functions/sync-power/index.ts) | Every 10 min, 00:00–02:59 UTC; each district daily, climatology yearly | Fetches 8 districts per call, drops missing values, computes monthly rain, ET₀, 30-day rain against normal, hot days and cold nights |
| [`sync-modis`](supabase/functions/sync-modis/index.ts) | Every 10 min, 03:00–05:59 UTC; each district weekly | Median NDVI, land surface temperature and evapotranspiration in a 5 × 5 km box around each district point |
| [`sync-appeears`](supabase/functions/sync-appeears/index.ts) | Hourly | Collects finished AppEEARS tasks, then submits the weekly SMAP task and the one-time elevation task; task IDs live in `sync_runs` |
| [`predict-risk`](supabase/functions/predict-risk/index.ts) | Daily at 06:15 UTC | Turns the latest observations into drought, flood, heat, frost, salinity and crop-stress levels (simple, documented rules) and writes `predictions` |

Long jobs process districts in batches so each run stays inside the Edge Function time limit. Progress is recorded in `sync_runs`.

### What we store

| Store | Don't store |
|---|---|
| Processed values, one row per metric per district or farm | Raw NASA JSON, CSV bundles or data files |
| The latest value plus about 12 weeks of history | Satellite images and map tiles |
| Climate averages per district (64 rows) | Data for places no farm is in |
| Latest risk predictions per district | Old predictions after they expire |
| Each farmer's farm and saved plans | |

NASA-derived data stays at roughly 10,000 rows (64 districts × about 12 metrics × 12 weeks), no matter how much NASA data exists.

### Tables

![Field Shift database tables](docs/diagrams/supabase-data-model.png)

*Interactive version: [docs/diagrams/supabase-data-model.html](docs/diagrams/supabase-data-model.html)*

| Table | Main columns | Purpose |
|---|---|---|
| `profiles` | id (→ auth.users), name, email, phone, language (en/bn), role (farmer / admin), blocked, provider, last_sign_in_at, sign_in_count | User details and roles; a trigger creates the row at sign-up |
| `farms` | id, user_id, district_id, area, irrigation, soil, lat, lng | Farm profile (one per account) |
| `plans` | id, farm_id, plan (jsonb), risks (jsonb), climate_snapshot (jsonb), created_at | Saved rotation plans |
| `districts` | id (e.g. `dhaka`), name, name_bn, division, lat, lng, soil, baseline rainfall and temp, risk, risk_bn | Seeded from `data/districts.ts` |
| `climate_normals` | district_id, monthly_rain_mm[12], monthly_wetness[12], temp_mean, humidity, solar_mj, et0_mm_day, fetched_at | 30-year NASA POWER averages |
| `observations` | id, district_id or farm_id, source (power / modis / smap / nasadem), metric, value, observed_at | Processed measurements from every NASA source; the `latest_observations` view gives the newest value of each |
| `predictions` | id, district_id or farm_id, kind, level, valid_until, computed_at | Risk levels from `predict-risk` |
| `sync_runs` | id, job, status, task_id, rows_updated, error, started_at | Sync health and AppEEARS tasks |
| `activity_log` | id, actor_id, action, target, created_at | Admin activity feed |

### Access rules (RLS)

- `districts`, `climate_normals`, and district-level `observations` and `predictions`: anyone can read; only Edge Functions (service key) can write.
- `farms` and `plans`: only the owner (`user_id = auth.uid()`); admins can read all.
- `profiles`: users can edit their own name, phone and language only. Role, blocked status and sign-in details can only be changed by an admin or the system.
- `activity_log` and `sync_runs`: admins only.

### Database setup

The schema lives in [supabase/migrations/](supabase/migrations/). Apply them in this order, either by pasting each into the Supabase SQL editor or with `npx supabase db push` after `npx supabase link`:

1. `20261108120000_init_schema.sql` — tables, access rules, triggers
2. `20261108120100_seed_districts.sql` — the 64 districts from `data/districts.ts`
3. `20261108130000_auth_tracking.sql` — sign-in details for the admin panel, activity log rules, blocking
4. `20261109090000_farm_sync_and_satellite.sql` — one farm per account, the latest-value view, keeping elevation

### Deploying the NASA sync

The four functions are in [supabase/functions/](supabase/functions/). Each is a single file.

1. Set the secrets (pick a long random `CRON_SECRET`; the Earthdata login is your free [NASA Earthdata](https://urs.earthdata.nasa.gov/) account):
   `npx supabase secrets set CRON_SECRET=<secret> EARTHDATA_USERNAME=<user> EARTHDATA_PASSWORD=<password> --project-ref <ref>`
2. Deploy each with JWT checks off (the functions check `CRON_SECRET` themselves):
   `npx supabase functions deploy sync-power --no-verify-jwt --project-ref <ref>`, then the same for `sync-modis`, `sync-appeears` and `predict-risk`. You can also paste each file into the dashboard's function editor and turn off "Enforce JWT verification".
3. Fill in your project URL and the same `CRON_SECRET` in [supabase/setup/schedule-sync.sql](supabase/setup/schedule-sync.sql) and run it in the SQL editor. It is safe to run again. Don't commit your real values.

The first fill takes a day or two of scheduled runs: NASA POWER finishes the first morning, MODIS over two mornings, and AppEEARS tasks take a few hours. To start sooner, run `select public.call_edge_function('sync-power');` a few times. Check progress with:

```sql
select job, status, rows_updated, error, started_at from sync_runs order by started_at desc;
```

### Secrets

| Secret | Used by | Where it lives |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | The web app | `.env.local` (git-ignored) |
| `CRON_SECRET` | All four Edge Functions and `schedule-sync.sql` | Supabase function secrets |
| `EARTHDATA_USERNAME`, `EARTHDATA_PASSWORD` | `sync-appeears` | Supabase function secrets |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Functions only | Provided by Supabase inside functions |

POWER and MODIS need no key. Never put the service role key or Earthdata password in a `NEXT_PUBLIC_` variable or commit them to git.

---

## Limitations

- NASA data is per district (around the district's centre point), not per farm.
- Salinity risk comes only from the district profile; no live salinity data is connected.
- The rotation is built in the browser so it works offline; only the risk levels come from the server.
- Deleting user accounts from the admin panel needs a server-side `admin-actions` function, which is not built yet.
- Free Supabase projects pause after about a week without visits, and scheduled syncs do not run while paused.
- The scoring model is a simplified comparison tool and has not been validated against field data. Income and fodder scores are relative values, not live market prices.

---

## Tech stack

- [Next.js 14](https://nextjs.org/) (App Router) and React 18
- TypeScript
- Tailwind CSS
- [Supabase](https://supabase.com/) (Postgres, Auth, Edge Functions, cron)
- Inter and Noto Sans Bengali fonts via `next/font`
- [lucide-react](https://lucide.dev/) icons
- NASA [POWER](https://power.larc.nasa.gov/), [MODIS via ORNL DAAC](https://modis.ornl.gov/) and [AppEEARS](https://appeears.earthdatacloud.nasa.gov/) (SMAP, NASADEM)

---

## Contributing

1. Create a branch from `main`.
2. Run `npm run lint` and `npm run build` before opening a pull request.
3. Add every user-facing string in both languages, using `t('English', 'বাংলা')` from `useApp()`.
4. Put database changes in a new file in `supabase/migrations/`; don't edit migrations that have already been applied.

---

## License

No license has been chosen yet, so all rights are reserved by the repository owner. Add a `LICENSE` file to allow reuse.

## Acknowledgements

- [NASA Space Apps Challenge](https://www.spaceappschallenge.org/)
- NASA Langley Research Center [POWER Project](https://power.larc.nasa.gov/) for climate data
- [ORNL DAAC](https://modis.ornl.gov/) for the MODIS web service
- NASA [AppEEARS](https://appeears.earthdatacloud.nasa.gov/) for SMAP and NASADEM data
