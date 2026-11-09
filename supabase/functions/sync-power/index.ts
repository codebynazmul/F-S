// Field Shift: NASA POWER sync.
//
// Fetches NASA POWER data for the 64 districts and stores only processed values:
//   - climate_normals: 30-year monthly averages (refreshed yearly)
//   - observations:    last-30-day summaries (refreshed daily)
// Raw NASA responses are never stored.
//
// Each call handles a small batch (stalest districts first) so it stays inside the
// Edge Function time limit. pg_cron calls it every 10 minutes for a few hours a day;
// calls with nothing to do return at once.
//
// Called with header `x-cron-secret: <CRON_SECRET>`. Deploy with JWT verification off.

import { createClient, type SupabaseClient } from 'jsr:@supabase/supabase-js@2';

const POWER = 'https://power.larc.nasa.gov/api/temporal';
const BATCH = 8;              // districts per call
const CONCURRENCY = 4;        // NASA requests at once
const TIMEOUT_MS = 25_000;
const NORMALS_MAX_AGE_DAYS = 365;
const DAILY_MAX_AGE_HOURS = 20;
const WINDOW_DAYS = 30;

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const MONTH_DAYS = [31, 28.25, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const NORMAL_PARAMS = 'PRECTOTCORR,T2M,RH2M,ALLSKY_SFC_SW_DWN,GWETROOT';
const DAILY_PARAMS = 'PRECTOTCORR,T2M_MAX,T2M_MIN,GWETROOT';

interface District { id: string; lat: number; lng: number }
interface Task { kind: 'normals' | 'daily'; district: District }
type Params = Record<string, Record<string, number>>;

Deno.serve(async (req) => {
  const secret = Deno.env.get('CRON_SECRET');
  if (!secret || req.headers.get('x-cron-secret') !== secret) {
    return new Response('Unauthorized', { status: 401 });
  }

  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  });

  const tasks = await pickTasks(db);
  if (tasks.length === 0) return json({ tasks: 0, message: 'Everything is up to date' });

  const { data: run } = await db.from('sync_runs').insert({ job: 'sync-power' }).select('id').single();
  let rows = 0;
  const errors: string[] = [];

  await pool(tasks, CONCURRENCY, async (task) => {
    try {
      const n = task.kind === 'normals' ? await syncNormals(db, task.district) : await syncDaily(db, task.district);
      rows += n;
    } catch (e) {
      errors.push(`${task.kind} ${task.district.id}: ${e instanceof Error ? e.message : String(e)}`);
    }
  });

  if (run) {
    await db.from('sync_runs').update({
      status: errors.length > 0 && rows === 0 ? 'error' : 'ok',
      rows_updated: rows,
      error: errors.length > 0 ? errors.join('; ').slice(0, 2000) : null,
      finished_at: new Date().toISOString(),
    }).eq('id', run.id);
  }
  return json({ tasks: tasks.length, rows, errors });
});

/** Missing or year-old climate averages first, then districts whose daily summary is stale. */
async function pickTasks(db: SupabaseClient): Promise<Task[]> {
  const now = Date.now();
  // Only fetch the fresh rows: at most one per district, so the result stays small.
  const [districts, freshNormals, freshDaily] = await Promise.all([
    db.from('districts').select('id, lat, lng'),
    db.from('climate_normals').select('district_id')
      .gte('fetched_at', new Date(now - NORMALS_MAX_AGE_DAYS * 86_400_000).toISOString()),
    db.from('observations').select('district_id')
      .eq('source', 'power').eq('metric', 'rain_30d_mm').is('farm_id', null)
      .gte('fetched_at', new Date(now - DAILY_MAX_AGE_HOURS * 3_600_000).toISOString()),
  ]);
  for (const r of [districts, freshNormals, freshDaily]) if (r.error) throw r.error;

  const hasNormals = new Set(freshNormals.data!.map(r => r.district_id));
  const hasDaily = new Set(freshDaily.data!.map(r => r.district_id));
  // Shuffle so a district that keeps failing can't hold up the others.
  const all = (districts.data as District[]).sort(() => Math.random() - 0.5);

  return [
    ...all.filter(d => !hasNormals.has(d.id)).map(d => ({ kind: 'normals' as const, district: d })),
    ...all.filter(d => !hasDaily.has(d.id)).map(d => ({ kind: 'daily' as const, district: d })),
  ].slice(0, BATCH);
}

async function fetchPower(path: string, params: string, d: District, extra = ''): Promise<Params> {
  const url = `${POWER}/${path}/point?parameters=${params}&community=AG&longitude=${d.lng}&latitude=${d.lat}&format=JSON${extra}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`NASA POWER HTTP ${res.status}`);
  const body = await res.json();
  const p = body?.properties?.parameter;
  if (!p) throw new Error('Unexpected NASA POWER response');
  return p;
}

/** NASA marks missing values as -999. */
const valid = (v: unknown): v is number => typeof v === 'number' && v > -900;
const round = (v: number, digits = 2) => Math.round(v * 10 ** digits) / 10 ** digits;

async function syncNormals(db: SupabaseClient, d: District): Promise<number> {
  const p = await fetchPower('climatology', NORMAL_PARAMS, d);
  const num = (v: unknown) => (valid(v) ? v : NaN);

  const monthlyRain = MONTHS.map((m, i) => Math.round(num(p.PRECTOTCORR?.[m]) * MONTH_DAYS[i]));
  const monthlyWet = MONTHS.map(m => round(num(p.GWETROOT?.[m]), 3));
  const tempMean = num(p.T2M?.ANN);
  const solar = num(p.ALLSKY_SFC_SW_DWN?.ANN);
  if ([...monthlyRain, tempMean].some(Number.isNaN)) throw new Error('Missing climatology values');

  // Hargreaves radiation formula: ET0 = 0.0135 (T + 17.8) Rs, with Rs in mm/day.
  const et0 = Number.isNaN(solar) ? null : round(0.0135 * (tempMean + 17.8) * solar * 0.408, 1);
  const orNull = (v: number) => (Number.isNaN(v) ? null : round(v));

  const { error } = await db.from('climate_normals').upsert({
    district_id: d.id,
    monthly_rain_mm: monthlyRain,
    monthly_wetness: monthlyWet.map(v => (Number.isNaN(v) ? 0 : v)),
    annual_rain_mm: monthlyRain.reduce((a, b) => a + b, 0),
    temp_mean: round(tempMean),
    humidity: orNull(num(p.RH2M?.ANN)),
    solar_mj: orNull(solar),
    root_wetness: orNull(num(p.GWETROOT?.ANN)),
    et0_mm_day: et0,
    fetched_at: new Date().toISOString(),
  });
  if (error) throw error;
  return 1;
}

const ymd = (date: Date) => date.toISOString().slice(0, 10).replace(/-/g, '');

async function syncDaily(db: SupabaseClient, d: District): Promise<number> {
  // NASA's newest days arrive late, so ask for 45 days and use the last 30 with data.
  const end = new Date(Date.now() - 86_400_000);
  const start = new Date(end.getTime() - 45 * 86_400_000);
  const p = await fetchPower('daily', DAILY_PARAMS, d, `&start=${ymd(start)}&end=${ymd(end)}`);

  const days = Object.keys(p.PRECTOTCORR ?? {}).filter(k => valid(p.PRECTOTCORR[k])).sort().slice(-WINDOW_DAYS);
  if (days.length < 25) throw new Error(`Only ${days.length} days of rainfall available`);

  const rain = days.reduce((sum, k) => sum + p.PRECTOTCORR[k], 0);
  const tmax = days.map(k => p.T2M_MAX?.[k]).filter(valid);
  const tmin = days.map(k => p.T2M_MIN?.[k]).filter(valid);
  const wet = Object.keys(p.GWETROOT ?? {}).filter(k => valid(p.GWETROOT[k])).sort();

  // Normal rain for the same calendar days, from the stored climate averages.
  const { data: normals } = await db.from('climate_normals').select('monthly_rain_mm').eq('district_id', d.id).maybeSingle();
  const normalRain = normals
    ? days.reduce((sum, k) => {
        const m = Number(k.slice(4, 6)) - 1;
        return sum + Number(normals.monthly_rain_mm[m]) / MONTH_DAYS[m];
      }, 0)
    : null;

  const last = days[days.length - 1];
  const observedAt = `${last.slice(0, 4)}-${last.slice(4, 6)}-${last.slice(6, 8)}`;
  const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

  const metrics: Record<string, number | null> = {
    rain_30d_mm: round(rain, 1),
    rain_30d_normal_mm: normalRain === null ? null : round(normalRain, 1),
    // Only meaningful when some rain is normally expected.
    rain_anomaly_pct: normalRain !== null && normalRain >= 10 ? Math.round(((rain - normalRain) / normalRain) * 100) : null,
    hot_days_30d: tmax.filter(v => v >= 35).length,
    cold_nights_30d: tmin.filter(v => v < 10).length,
    tmax_mean_30d: tmax.length ? round(mean(tmax), 1) : null,
    tmin_mean_30d: tmin.length ? round(mean(tmin), 1) : null,
    root_wetness: wet.length ? round(p.GWETROOT[wet[wet.length - 1]], 3) : null,
  };

  const fetchedAt = new Date().toISOString();
  const rows = Object.entries(metrics)
    .filter((e): e is [string, number] => e[1] !== null)
    .map(([metric, value]) => ({
      district_id: d.id, farm_id: null, source: 'power', metric, value, observed_at: observedAt, fetched_at: fetchedAt,
    }));

  const { error } = await db.from('observations')
    .upsert(rows, { onConflict: 'district_id,farm_id,source,metric,observed_at' });
  if (error) throw error;
  return rows.length;
}

/** Runs `fn` over `items`, at most `limit` at a time. */
async function pool<T>(items: T[], limit: number, fn: (item: T) => Promise<void>) {
  const queue = [...items];
  await Promise.all(Array.from({ length: Math.min(limit, queue.length) }, async () => {
    while (queue.length) await fn(queue.shift()!);
  }));
}

function json(body: unknown) {
  return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } });
}
