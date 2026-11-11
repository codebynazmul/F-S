// Agro Cosmic Weave: risk predictions.
//
// Turns the processed NASA data already in the database into a risk level for each
// district: drought, flood, heat, frost (cold), salinity and crop stress. Writes one
// row per district and kind to `predictions` (the latest one replaces the old one).
//
// These are transparent rules, not a trained model. Each score adds up simple signals
// listed below, and the thresholds are easy to tune.
//
// Called with header `x-cron-secret: <CRON_SECRET>`, after the daily syncs.

import { createClient, type SupabaseClient } from 'jsr:@supabase/supabase-js@2';

const VALID_DAYS = 7;

type Kind = 'drought' | 'flood' | 'heat' | 'frost' | 'salinity' | 'crop_stress';
interface District { id: string; rainfall: number; risk: string }
interface Normals { district_id: string; annual_rain_mm: number; temp_mean: number }
interface Obs { district_id: string; metric: string; value: number }

Deno.serve(async (req) => {
  const secret = Deno.env.get('CRON_SECRET');
  if (!secret || req.headers.get('x-cron-secret') !== secret) {
    return new Response('Unauthorized', { status: 401 });
  }
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  });

  const { data: run } = await db.from('sync_runs').insert({ job: 'predict-risk' }).select('id').single();
  try {
    const rows = await predictAll(db);
    if (run) await db.from('sync_runs').update({ status: 'ok', rows_updated: rows, finished_at: new Date().toISOString() }).eq('id', run.id);
    return json({ rows });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (run) await db.from('sync_runs').update({ status: 'error', error: message, finished_at: new Date().toISOString() }).eq('id', run.id);
    return json({ error: message }, 500);
  }
});

async function predictAll(db: SupabaseClient): Promise<number> {
  const [districts, normals, obs] = await Promise.all([
    db.from('districts').select('id, rainfall, risk'),
    db.from('climate_normals').select('district_id, annual_rain_mm, temp_mean'),
    fetchAll<Obs>(db, 'latest_observations', 'district_id, metric, value', q => q.is('farm_id', null)),
  ]);
  if (districts.error) throw districts.error;
  if (normals.error) throw normals.error;

  const normalsOf = new Map((normals.data as Normals[]).map(n => [n.district_id, n]));
  const metricsOf = new Map<string, Map<string, number>>();
  for (const o of obs) {
    if (!metricsOf.has(o.district_id)) metricsOf.set(o.district_id, new Map());
    metricsOf.get(o.district_id)!.set(o.metric, Number(o.value));
  }

  const validUntil = new Date(Date.now() + VALID_DAYS * 86_400_000).toISOString().slice(0, 10);
  const computedAt = new Date().toISOString();
  const rows = [];
  for (const d of districts.data as District[]) {
    const m = metricsOf.get(d.id) ?? new Map<string, number>();
    const scores = scoreDistrict(d, normalsOf.get(d.id), (k) => m.get(k) ?? null);
    for (const [kind, score] of Object.entries(scores) as [Kind, number][]) {
      rows.push({
        district_id: d.id, farm_id: null, kind,
        score: Math.round(score * 100) / 100,
        level: score >= 0.6 ? 'high' : score >= 0.3 ? 'medium' : 'low',
        valid_until: validUntil, computed_at: computedAt,
      });
    }
  }

  const { error } = await db.from('predictions').upsert(rows, { onConflict: 'district_id,farm_id,kind' });
  if (error) throw error;
  return rows.length;
}

/** Each score is 0–1. Signals that are missing simply add nothing. */
function scoreDistrict(d: District, n: Normals | undefined, get: (metric: string) => number | null): Record<Kind, number> {
  const text = d.risk.toLowerCase();
  const has = (re: RegExp) => re.test(text);
  const clamp = (v: number) => Math.max(0, Math.min(1, v));
  const annualRain = n ? Number(n.annual_rain_mm) : d.rainfall;

  const anomaly = get('rain_anomaly_pct');           // NASA POWER, last 30 days vs normal
  const normal30 = get('rain_30d_normal_mm');
  const rootWet = get('root_wetness');               // NASA POWER GWETROOT, 0–1
  const smapRoot = get('soil_moisture_root');        // SMAP L4, m³/m³
  const hotDays = get('hot_days_30d');
  const coldNights = get('cold_nights_30d');
  const tminMean = get('tmin_mean_30d');
  const lst = get('lst_day_c');                      // MODIS land surface temperature
  const ndvi = get('ndvi');                          // MODIS vegetation health

  let drought = 0;
  if (anomaly !== null && normal30 !== null && normal30 >= 30) {
    if (anomaly <= -60) drought += 0.45; else if (anomaly <= -40) drought += 0.3;
  }
  if (rootWet !== null) { if (rootWet < 0.3) drought += 0.3; else if (rootWet < 0.4) drought += 0.15; }
  if (smapRoot !== null) { if (smapRoot < 0.15) drought += 0.3; else if (smapRoot < 0.2) drought += 0.15; }
  if (annualRain < 1600) drought += 0.15;
  if (has(/drought|arid|groundwater|dry|moisture|water shortage/)) drought += 0.15;

  let flood = has(/flood|inundation|waterlog|tidal|haor|surge|standing water|runoff/) ? 0.3 : 0;
  if (anomaly !== null && normal30 !== null && normal30 >= 100 && anomaly >= 50) flood += 0.35;
  if (rootWet !== null && rootWet >= 0.85) flood += 0.2;
  if (smapRoot !== null && smapRoot >= 0.4) flood += 0.15;

  let heat = 0;
  if (hotDays !== null) { if (hotDays >= 10) heat += 0.55; else if (hotDays >= 3) heat += 0.3; }
  if (lst !== null) { if (lst >= 40) heat += 0.25; else if (lst >= 36) heat += 0.1; }
  if (has(/heat|40°c/)) heat += 0.15;

  let frost = 0;
  if (coldNights !== null) { if (coldNights >= 10) frost += 0.55; else if (coldNights >= 3) frost += 0.3; }
  if (tminMean !== null && tminMean < 12) frost += 0.2;
  if (has(/cold/)) frost += 0.15;

  // NASA POWER and MODIS cannot measure salt, so this comes from the district profile.
  const salinity = has(/salin|saline|shrimp/) ? 0.7 : 0.05;

  let cropStress = 0;
  if (ndvi !== null) { if (ndvi < 0.25) cropStress += 0.45; else if (ndvi < 0.4) cropStress += 0.2; }
  cropStress += 0.4 * Math.max(drought, heat);

  return {
    drought: clamp(drought), flood: clamp(flood), heat: clamp(heat), frost: clamp(frost),
    salinity, crop_stress: clamp(cropStress),
  };
}

/** Reads every row, 1000 at a time (Supabase's default page limit). */
async function fetchAll<T>(
  db: SupabaseClient, table: string, columns: string,
  // deno-lint-ignore no-explicit-any
  filter: (q: any) => any,
): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await filter(db.from(table).select(columns)).range(from, from + 999);
    if (error) throw error;
    out.push(...(data as T[]));
    if (!data || data.length < 1000) return out;
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
