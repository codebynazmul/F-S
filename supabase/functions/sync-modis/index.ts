// Field Shift: MODIS sync (ORNL DAAC MODIS Web Service, no key needed).
//
// For each district, reads the newest MODIS values around the district point and
// stores only one processed number per metric in `observations`:
//   ndvi       vegetation health, 0–1          (MOD13Q1, 250 m, 16-day)
//   lst_day_c  daytime land temperature, °C     (MOD11A2, 1 km, 8-day)
//   et_mm_day  evapotranspiration, mm/day      (MOD16A2, 500 m, 8-day)
// Each value is the median of the valid pixels in a 5 × 5 km box, so a town at the
// district point doesn't dominate.
//
// Refreshed weekly. Each call handles a small batch, stalest first.
// Called with header `x-cron-secret: <CRON_SECRET>`.

import { createClient, type SupabaseClient } from 'jsr:@supabase/supabase-js@2';

const API = 'https://modis.ornl.gov/rst/api/v1';
const BATCH = 6;             // district × product pairs per call
const CONCURRENCY = 3;
const TIMEOUT_MS = 40_000;
const MAX_AGE_DAYS = 6;
const KM = 2;                // 2 km each way = 5 × 5 km box
const LOOKBACK_DAYS = 48;    // enough for 3 sixteen-day composites

interface Product {
  id: string;
  band: string;
  metric: string;
  /** Turns a raw pixel into the stored value, or null when it is a fill value. */
  convert: (raw: number, scale: number) => number | null;
}

const PRODUCTS: Product[] = [
  { id: 'MOD13Q1', band: '250m_16_days_NDVI', metric: 'ndvi',
    convert: (v, s) => (v < -2000 || v > 10000 ? null : v * s) },
  { id: 'MOD11A2', band: 'LST_Day_1km', metric: 'lst_day_c',
    convert: (v, s) => (v <= 0 ? null : v * s - 273.15) },
  { id: 'MOD16A2', band: 'ET_500m', metric: 'et_mm_day',
    convert: (v, s) => (v < 0 || v > 32700 ? null : (v * s) / 8) },
];

interface District { id: string; lat: number; lng: number }
interface Task { district: District; product: Product }

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

  const { data: run } = await db.from('sync_runs').insert({ job: 'sync-modis' }).select('id').single();
  let rows = 0;
  const errors: string[] = [];
  await pool(tasks, CONCURRENCY, async (task) => {
    try {
      const n = await syncOne(db, task);
      rows += n;
    } catch (e) {
      errors.push(`${task.product.id} ${task.district.id}: ${e instanceof Error ? e.message : String(e)}`);
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

async function pickTasks(db: SupabaseClient): Promise<Task[]> {
  const since = new Date(Date.now() - MAX_AGE_DAYS * 86_400_000).toISOString();
  const [districts, fresh] = await Promise.all([
    db.from('districts').select('id, lat, lng'),
    // At most 64 × 3 rows: one per district and metric fetched this week.
    db.from('latest_observations').select('district_id, metric')
      .eq('source', 'modis').is('farm_id', null).gte('fetched_at', since),
  ]);
  if (districts.error) throw districts.error;
  if (fresh.error) throw fresh.error;

  const done = new Set((fresh.data ?? []).map(r => `${r.district_id}:${r.metric}`));
  const tasks: Task[] = [];
  for (const d of (districts.data as District[]).sort(() => Math.random() - 0.5)) {
    for (const p of PRODUCTS) if (!done.has(`${d.id}:${p.metric}`)) tasks.push({ district: d, product: p });
  }
  return tasks.slice(0, BATCH);
}

/** MODIS dates look like A2026289 (year + day of year). */
function modisDate(date: Date): string {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const day = Math.floor((date.getTime() - start) / 86_400_000);
  return `A${date.getUTCFullYear()}${String(day).padStart(3, '0')}`;
}

async function syncOne(db: SupabaseClient, { district: d, product: p }: Task): Promise<number> {
  const now = new Date();
  const url = `${API}/${p.id}/subset?latitude=${d.lat}&longitude=${d.lng}&band=${p.band}` +
    `&startDate=${modisDate(new Date(now.getTime() - LOOKBACK_DAYS * 86_400_000))}&endDate=${modisDate(now)}` +
    `&kmAboveBelow=${KM}&kmLeftRight=${KM}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`MODIS HTTP ${res.status}`);
  const body = await res.json();
  const scale = Number(body.scale);
  const subsets: { calendar_date: string; data: number[] }[] = body.subset ?? [];
  if (!Number.isFinite(scale) || subsets.length === 0) throw new Error(body.message || 'No MODIS data in range');

  // Newest composite with enough valid pixels (clouds can blank out a whole composite).
  const newestFirst = [...subsets].sort((a, b) => b.calendar_date.localeCompare(a.calendar_date));
  for (const s of newestFirst) {
    const values = s.data.map(v => p.convert(v, scale)).filter((v): v is number => v !== null);
    if (values.length < Math.max(3, s.data.length * 0.1)) continue;
    const { error } = await db.from('observations').upsert({
      district_id: d.id, farm_id: null, source: 'modis', metric: p.metric,
      value: Math.round(median(values) * 1000) / 1000,
      observed_at: s.calendar_date,
      fetched_at: new Date().toISOString(),
    }, { onConflict: 'district_id,farm_id,source,metric,observed_at' });
    if (error) throw error;
    return 1;
  }
  throw new Error('Only cloudy or empty pixels in the last composites');
}

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

async function pool<T>(items: T[], limit: number, fn: (item: T) => Promise<void>) {
  const queue = [...items];
  await Promise.all(Array.from({ length: Math.min(limit, queue.length) }, async () => {
    while (queue.length) await fn(queue.shift()!);
  }));
}

function json(body: unknown) {
  return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } });
}
