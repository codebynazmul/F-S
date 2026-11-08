import { supabase } from './supabase';

/*
 * NASA POWER data for a district, read from our database.
 * The sync-power Edge Function fetches it from NASA on a schedule; the app never
 * calls NASA directly.
 */

/** Long-term monthly climate averages for one district (30-year NASA POWER climatology). */
export interface PowerClimate {
  monthlyRainMm: number[];     // 12 values, mm per month
  monthlyWetness: number[];    // 12 values, root-zone soil wetness 0–1
  annualRainMm: number;
  tempMean: number;            // °C
  // The values below are null when NASA has no data for them.
  humidity: number | null;     // %
  solarMJ: number | null;      // MJ/m²/day
  rootWetness: number | null;  // 0–1
  et0MmDay: number | null;     // estimated reference evapotranspiration
}

/** Summary of the last 30 days with NASA data. Values are null when not available. */
export interface RecentConditions {
  periodEnd: string;                // last day with data, YYYY-MM-DD
  rain30dMm: number | null;
  rain30dNormalMm: number | null;   // what is normal for the same days
  rainAnomalyPct: number | null;    // + wetter / − drier than normal
  hotDays30d: number | null;        // days ≥ 35 °C
  coldNights30d: number | null;     // nights < 10 °C
  tmaxMean30d: number | null;
  tminMean30d: number | null;
  rootWetness: number | null;
}

/** Newest satellite values around the district point. Null when not synced yet. */
export interface Satellite {
  ndvi: number | null;                 // MODIS vegetation health, 0–1
  ndviDate: string | null;
  lstDayC: number | null;              // MODIS daytime land surface temperature, °C
  etMmDay: number | null;              // MODIS evapotranspiration, mm/day
  soilMoistureRoot: number | null;     // SMAP L4 root zone, m³/m³
  soilMoistureSurface: number | null;  // SMAP L4 surface, m³/m³
  smapDate: string | null;
  elevationM: number | null;           // NASADEM
}

export type RiskKind = 'drought' | 'flood' | 'heat' | 'frost' | 'salinity' | 'crop_stress';
export type RiskLevel = 'low' | 'medium' | 'high';

/** A risk level computed on the server by the predict-risk function. */
export interface Prediction {
  kind: RiskKind;
  level: RiskLevel;
  score: number | null;
  validUntil: string;
}

export interface DistrictClimate {
  normals: PowerClimate | null;
  recent: RecentConditions | null;
  /** When the server last fetched the climate averages from NASA (ms). */
  updatedAt: number | null;
  /** Missing in offline copies saved by older versions of the app. */
  satellite?: Satellite | null;
  predictions?: Prediction[];
}

export type ClimateStatus = 'loading' | 'ok' | 'missing' | 'error';

interface NormalsRow {
  monthly_rain_mm: number[];
  monthly_wetness: number[];
  annual_rain_mm: number;
  temp_mean: number;
  humidity: number | null;
  solar_mj: number | null;
  root_wetness: number | null;
  et0_mm_day: number | null;
  fetched_at: string;
}

interface ObservationRow { source: string; metric: string; value: number; observed_at: string }
interface PredictionRow { kind: RiskKind; level: RiskLevel; score: number | null; valid_until: string }

export async function loadDistrictClimate(districtId: string): Promise<DistrictClimate> {
  const [normals, obs, preds] = await Promise.all([
    supabase.from('climate_normals').select('*').eq('district_id', districtId).maybeSingle<NormalsRow>(),
    // Newest value of every metric from every NASA source.
    supabase.from('latest_observations')
      .select('source, metric, value, observed_at')
      .eq('district_id', districtId).is('farm_id', null)
      .returns<ObservationRow[]>(),
    supabase.from('predictions')
      .select('kind, level, score, valid_until')
      .eq('district_id', districtId).is('farm_id', null)
      .returns<PredictionRow[]>(),
  ]);
  if (normals.error) throw normals.error;
  if (obs.error) throw obs.error;
  if (preds.error) throw preds.error;
  const rows = obs.data ?? [];
  const today = new Date().toISOString().slice(0, 10);

  const n = normals.data;
  return {
    normals: n && {
      monthlyRainMm: n.monthly_rain_mm.map(Number),
      monthlyWetness: n.monthly_wetness.map(Number),
      annualRainMm: Number(n.annual_rain_mm),
      tempMean: Number(n.temp_mean),
      humidity: numOrNull(n.humidity),
      solarMJ: numOrNull(n.solar_mj),
      rootWetness: numOrNull(n.root_wetness),
      et0MmDay: numOrNull(n.et0_mm_day),
    },
    recent: recentFrom(rows.filter(r => r.source === 'power')),
    updatedAt: n ? Date.parse(n.fetched_at) : null,
    satellite: satelliteFrom(rows),
    // Expired predictions are kept for a week on the server; don't show them.
    predictions: (preds.data ?? [])
      .filter(p => p.valid_until >= today)
      .map(p => ({ kind: p.kind, level: p.level, score: p.score === null ? null : Number(p.score), validUntil: p.valid_until })),
  };
}

/** Missing values are null, not NaN: NaN can't be saved in the offline copy (JSON turns it into null). */
const numOrNull = (v: number | string | null | undefined): number | null => {
  const x = Number(v ?? NaN);
  return Number.isFinite(x) ? x : null;
};

function satelliteFrom(rows: ObservationRow[]): Satellite | null {
  const find = (source: string, metric: string) => rows.find(r => r.source === source && r.metric === metric);
  const val = (source: string, metric: string) => {
    const r = find(source, metric);
    return r ? Number(r.value) : null;
  };
  const s: Satellite = {
    ndvi: val('modis', 'ndvi'),
    ndviDate: find('modis', 'ndvi')?.observed_at ?? null,
    lstDayC: val('modis', 'lst_day_c'),
    etMmDay: val('modis', 'et_mm_day'),
    soilMoistureRoot: val('smap', 'soil_moisture_root'),
    soilMoistureSurface: val('smap', 'soil_moisture_surface'),
    smapDate: find('smap', 'soil_moisture_root')?.observed_at ?? null,
    elevationM: val('nasadem', 'elevation_m'),
  };
  return Object.values(s).some(v => v !== null) ? s : null;
}

/** NASA POWER's last-30-day summary (rows are already the newest per metric). */
function recentFrom(rows: ObservationRow[]): RecentConditions | null {
  if (rows.length === 0) return null;
  const periodEnd = rows.map(r => r.observed_at).sort().pop()!;
  const latest = new Map(rows.filter(r => r.observed_at === periodEnd).map(r => [r.metric, Number(r.value)]));
  const get = (metric: string) => latest.get(metric) ?? null;
  return {
    periodEnd,
    rain30dMm: get('rain_30d_mm'),
    rain30dNormalMm: get('rain_30d_normal_mm'),
    rainAnomalyPct: get('rain_anomaly_pct'),
    hotDays30d: get('hot_days_30d'),
    coldNights30d: get('cold_nights_30d'),
    tmaxMean30d: get('tmax_mean_30d'),
    tminMean30d: get('tmin_mean_30d'),
    rootWetness: get('root_wetness'),
  };
}
