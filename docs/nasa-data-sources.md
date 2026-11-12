# NASA data sources

Agro Cosmic Weave uses three NASA APIs, which together provide five datasets. The browser never calls NASA.
Supabase Edge Functions fetch the data on a schedule. They store only processed values in
the database and never keep the raw responses. The app then reads those tables through
[`lib/climate.ts`](../lib/climate.ts).

```
NASA POWER ─┐
MODIS (ORNL)├─► Edge Functions (pg_cron) ─► climate_normals / observations ─► predict-risk ─► predictions
AppEEARS ───┘                                          │                                       │
                                                       └──────────────► app (lib/climate.ts) ◄─┘
```

| API | Base URL | Key needed | Edge Function | Datasets |
|---|---|---|---|---|
| NASA POWER | `https://power.larc.nasa.gov/api/temporal` | No | `sync-power` | POWER climatology and daily data |
| ORNL DAAC MODIS Web Service | `https://modis.ornl.gov/rst/api/v1` | No | `sync-modis` | MOD13Q1, MOD11A2, MOD16A2 |
| AppEEARS | `https://appeears.earthdatacloud.nasa.gov/api` | Yes, an Earthdata Login | `sync-appeears` | SMAP L4 (`SPL4SMGP`), NASADEM (`NASADEM_NC`) |

All values are for the point of each of the 64 districts in the `districts` table.

---

## 1. NASA POWER: climate

Source: [`supabase/functions/sync-power/index.ts`](../supabase/functions/sync-power/index.ts)

Every request uses `community=AG`, so values come back in agricultural units.

### Long-term averages: `/climatology/point`

| Parameter | Meaning | Stored as (`climate_normals`) |
|---|---|---|
| `PRECTOTCORR` | Precipitation, mm/day (monthly) | `monthly_rain_mm` (mm/day × days in month), `annual_rain_mm` |
| `T2M` | Air temperature at 2 m, °C | `temp_mean` (annual) |
| `RH2M` | Relative humidity at 2 m, % | `humidity` |
| `ALLSKY_SFC_SW_DWN` | Sunlight reaching the ground, MJ/m²/day | `solar_mj` |
| `GWETROOT` | Root-zone soil wetness, 0–1 | `monthly_wetness`, `root_wetness` |
| *(derived)* | Reference evapotranspiration (Hargreaves radiation formula: `0.0135 (T + 17.8) · Rs · 0.408`) | `et0_mm_day` |

Refreshed once a year.

**Why it is used:** these averages replace the fixed rainfall and temperature in
[`data/districts.ts`](../data/districts.ts) when the app scores which crops suit a district.
When a district has no synced data yet, the app falls back to that fixed table
(`climateSource: 'baseline'`).

### Last 30 days: `/daily/point`

The function requests 45 days ending yesterday and keeps the 30 most recent days that have
data, because POWER's newest days arrive a few days late.

| Parameter | Stored metrics (`observations`, `source = 'power'`) |
|---|---|
| `PRECTOTCORR` | `rain_30d_mm`, `rain_30d_normal_mm`, `rain_anomaly_pct` |
| `T2M_MAX` | `hot_days_30d` (≥ 35 °C), `tmax_mean_30d` |
| `T2M_MIN` | `cold_nights_30d` (< 10 °C), `tmin_mean_30d` |
| `GWETROOT` | `root_wetness` (newest day) |

Refreshed every day.

**Why it is used:** it shows whether conditions right now are drier, wetter, hotter or
colder than normal. These are the main drought, flood, heat and cold signals.

---

## 2. MODIS (ORNL DAAC): satellite land data

Source: [`supabase/functions/sync-modis/index.ts`](../supabase/functions/sync-modis/index.ts)

The function calls the `/{product}/subset` endpoint for a 5 × 5 km box around each district point.
It takes the newest composite that has enough valid pixels and stores the median value.
Pixels that never have a value because of the land cover (city, water) do not count against
the minimum number of valid pixels.

| Product | Band | Resolution | Metric (`source = 'modis'`) | Why it is used |
|---|---|---|---|---|
| MOD13Q1 | `250m_16_days_NDVI` | 250 m, 16-day | `ndvi` (0–1) | How green the vegetation is: the crop stress signal |
| MOD11A2 | `LST_Day_1km` | 1 km, 8-day | `lst_day_c` (°C) | Daytime ground temperature: heat stress |
| MOD16A2 | `ET_500m` | 500 m, 8-day | `et_mm_day` | Evapotranspiration, **only displayed** in the NASA tab |

Refreshed weekly.

---

## 3. AppEEARS: SMAP and NASADEM

Source: [`supabase/functions/sync-appeears/index.ts`](../supabase/functions/sync-appeears/index.ts)

AppEEARS works through tasks that take minutes to hours to finish. Each hourly call does two things:

1. **Collect:** check the pending tasks recorded in `sync_runs`. When one is done, download its
   results CSV and store the values.
2. **Submit:** start new tasks when they are due. One point task covers all 64 districts.

The function always picks the newest version of a product from `/product`.

| Product | Layers | Metric | Refresh | Why it is used |
|---|---|---|---|---|
| SMAP L4 `SPL4SMGP` | `Geophysical_Data_sm_rootzone`, `Geophysical_Data_sm_surface` | `soil_moisture_root`, `soil_moisture_surface` (m³/m³; `source = 'smap'`) | Weekly (10-day lookback, daily mean of 3-hourly values) | Soil moisture measured by satellite, to check POWER's modelled soil wetness for drought and flood |
| NASADEM `NASADEM_NC` | `NASADEM_HGT` | `elevation_m` (`source = 'nasadem'`) | Once; never deleted | Low land counts as a flood risk |

Field-level products (HLS, ECOSTRESS) are not used yet. They need each farm's GPS point,
which the app does not collect.

**Required secrets:** `EARTHDATA_USERNAME`, `EARTHDATA_PASSWORD` (free account at
<https://urs.earthdata.nasa.gov/>).

---

## How the data is used

### Risk levels: `predict-risk`

Source: [`supabase/functions/predict-risk/index.ts`](../supabase/functions/predict-risk/index.ts)

This function runs daily after the syncs. It turns the stored values into a score from 0 to 1 for each
district and risk, using fixed rules that are easy to read. It is not a trained model.
A score of 0.6 or more is `high`, 0.3 or more is `medium`, and anything lower is `low`.
Predictions are valid for 7 days.

| Risk | Signals |
|---|---|
| Drought | POWER rain anomaly, POWER `root_wetness`, SMAP root-zone moisture, annual rain < 1600 mm, keywords in the district text |
| Flood | Keywords in the district text, POWER rain anomaly, high `root_wetness`, high SMAP moisture |
| Heat | POWER `hot_days_30d`, MODIS `lst_day_c`, keywords in the district text |
| Frost / cold | POWER `cold_nights_30d`, `tmin_mean_30d`, keywords in the district text |
| Salinity | District text only, because none of these NASA sources measure salt |
| Crop stress | MODIS `ndvi`, plus 0.4 × the higher of drought and heat |

### In the app

- [`lib/climate.ts`](../lib/climate.ts) reads `climate_normals`, `latest_observations` and
  `predictions` for the selected district. [`components/AppProvider.tsx`](../components/AppProvider.tsx)
  keeps an offline copy.
- [`lib/recommend.ts`](../lib/recommend.ts) turns the values into risk flags. Each flag records the source
  that supports it (`nasa_power`, `modis`, `smap`, `nasadem`, `risk_model`).
- [`components/tabs/NasaTab.tsx`](../components/tabs/NasaTab.tsx) shows every value together with its source.

---

## Schedule

From [`supabase/setup/schedule-sync.sql`](../supabase/setup/schedule-sync.sql). Times are UTC; Bangladesh is UTC+6.

| Job | Cron | Work per call |
|---|---|---|
| `sync-power` | `*/10 0-2 * * *` | 8 district tasks |
| `sync-modis` | `*/10 3-5 * * *` | 6 district × product pairs |
| `sync-appeears` | `40 * * * *` | Collect finished tasks and submit new ones |
| `predict-risk` | `15 6 * * *` | All districts |
| `prune-observations` | `30 3 * * *` | Delete observations older than about 12 weeks (elevation is kept) |

pg_cron calls each function through `public.call_edge_function()`, which sends the
`x-cron-secret` header. The project URL and the secret are stored in Supabase Vault.

Check recent runs:

```sql
select job, status, rows_updated, error, started_at
from public.sync_runs order by started_at desc limit 20;
```
