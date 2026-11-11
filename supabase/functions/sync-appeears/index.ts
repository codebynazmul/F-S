// Agro Cosmic Weave: AppEEARS sync (needs a free NASA Earthdata Login).
//
// AppEEARS works with tasks that take minutes to hours, so every call does two things:
//   1. Collect: check pending tasks; when one is done, read its CSV results and store
//      one processed value per district and metric in `observations`.
//   2. Submit: start new tasks when they are due.
//        smap       weekly   SMAP L4 root-zone and surface soil moisture (m³/m³)
//        elevation  once     NASADEM elevation (m), never pruned
// One task covers all 64 districts. Task ids are kept in `sync_runs`.
//
// Field-level products (HLS, ECOSTRESS) need each farm's GPS point, which the app does
// not collect yet.
//
// Secrets: CRON_SECRET, EARTHDATA_USERNAME, EARTHDATA_PASSWORD.
// Called with header `x-cron-secret: <CRON_SECRET>`, about once an hour.

import { createClient, type SupabaseClient } from 'jsr:@supabase/supabase-js@2';

const API = 'https://appeears.earthdatacloud.nasa.gov/api';
const SMAP_EVERY_DAYS = 6;
const SMAP_LOOKBACK_DAYS = 10;
const TASK_TIMEOUT_HOURS = 48;
const ERROR_BACKOFF_HOURS = 6;

type Job = 'appeears-smap' | 'appeears-elevation';
interface District { id: string; lat: number; lng: number }
interface PendingRun { id: string; job: Job; task_id: string; started_at: string }

Deno.serve(async (req) => {
  const secret = Deno.env.get('CRON_SECRET');
  if (!secret || req.headers.get('x-cron-secret') !== secret) {
    return new Response('Unauthorized', { status: 401 });
  }
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  });

  try {
    const token = await login();
    const collected = await collect(db, token);
    const submitted = await submitDue(db, token);
    return json({ collected, submitted });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});

// ---------------------------------------------------------------------------
// AppEEARS API
// ---------------------------------------------------------------------------

async function login(): Promise<string> {
  const user = Deno.env.get('EARTHDATA_USERNAME');
  const pass = Deno.env.get('EARTHDATA_PASSWORD');
  if (!user || !pass) throw new Error('Set EARTHDATA_USERNAME and EARTHDATA_PASSWORD as function secrets');
  const res = await fetch(`${API}/login`, {
    method: 'POST',
    headers: { Authorization: `Basic ${btoa(`${user}:${pass}`)}`, 'Content-Length': '0' },
  });
  if (!res.ok) throw new Error(`Earthdata login failed (HTTP ${res.status})`);
  return (await res.json()).token;
}

async function api(token: string, path: string, init: RequestInit = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...(init.body ? { 'Content-Type': 'application/json' } : {}) },
    signal: AbortSignal.timeout(60_000),
  });
  if (!res.ok) throw new Error(`AppEEARS ${path} HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res;
}

/** Newest available version of a product, e.g. SPL4SMGP → SPL4SMGP.008. */
async function latestVersion(prefix: string): Promise<string> {
  const res = await fetch(`${API}/product`, { signal: AbortSignal.timeout(60_000) });
  if (!res.ok) throw new Error(`AppEEARS product list HTTP ${res.status}`);
  const all: { ProductAndVersion: string; Available: boolean }[] = await res.json();
  const match = all
    .filter(p => p.Available && p.ProductAndVersion.startsWith(`${prefix}.`))
    .map(p => p.ProductAndVersion)
    .sort();
  if (match.length === 0) throw new Error(`AppEEARS has no product ${prefix}`);
  return match[match.length - 1];
}

const mdy = (d: Date) =>
  `${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}-${d.getUTCFullYear()}`;

// ---------------------------------------------------------------------------
// 1. Collect finished tasks
// ---------------------------------------------------------------------------

async function collect(db: SupabaseClient, token: string): Promise<string[]> {
  const { data, error } = await db.from('sync_runs').select('id, job, task_id, started_at')
    .in('job', ['appeears-smap', 'appeears-elevation']).eq('status', 'pending').not('task_id', 'is', null);
  if (error) throw error;

  const report: string[] = [];
  for (const run of (data ?? []) as PendingRun[]) {
    const finish = (status: 'ok' | 'error', fields: Record<string, unknown>) =>
      db.from('sync_runs').update({ status, finished_at: new Date().toISOString(), ...fields }).eq('id', run.id);
    try {
      const task = await (await api(token, `/task/${run.task_id}`)).json();
      if (task.status === 'done') {
        const rows = await storeResults(db, token, run);
        await finish('ok', { rows_updated: rows });
        report.push(`${run.job}: stored ${rows} rows`);
      } else if (task.status === 'error') {
        await finish('error', { error: `AppEEARS task failed: ${JSON.stringify(task.error ?? task).slice(0, 500)}` });
        report.push(`${run.job}: task failed`);
      } else if (Date.now() - Date.parse(run.started_at) > TASK_TIMEOUT_HOURS * 3_600_000) {
        await finish('error', { error: `Still "${task.status}" after ${TASK_TIMEOUT_HOURS} hours` });
        report.push(`${run.job}: timed out`);
      } else {
        report.push(`${run.job}: ${task.status}`);
      }
    } catch (e) {
      report.push(`${run.job}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  return report;
}

async function storeResults(db: SupabaseClient, token: string, run: PendingRun): Promise<number> {
  const bundle = await (await api(token, `/bundle/${run.task_id}`)).json();
  const files: { file_id: string; file_name: string; file_type: string }[] = bundle.files ?? [];
  const results = files.filter(f => f.file_type === 'csv' && /results/i.test(f.file_name));
  if (results.length === 0) throw new Error('No results CSV in the task bundle');

  const today = new Date().toISOString().slice(0, 10);
  const fetchedAt = new Date().toISOString();
  const rows: Record<string, unknown>[] = [];

  for (const file of results) {
    const csv = parseCsv(await (await api(token, `/bundle/${run.task_id}/${file.file_id}`)).text());
    if (run.job === 'appeears-smap') {
      rows.push(...smapRows(csv, fetchedAt));
    } else {
      const col = csv.header.findIndex(h => h.endsWith('NASADEM_HGT'));
      const idCol = csv.header.indexOf('ID');
      if (col < 0 || idCol < 0) throw new Error('Unexpected NASADEM CSV columns');
      for (const r of csv.rows) {
        const v = Number(r[col]);
        if (!Number.isFinite(v) || v <= -32000) continue;
        rows.push({ district_id: r[idCol], farm_id: null, source: 'nasadem', metric: 'elevation_m', value: v, observed_at: today, fetched_at: fetchedAt });
      }
    }
  }

  if (rows.length === 0) return 0;
  const { error } = await db.from('observations').upsert(rows, { onConflict: 'district_id,farm_id,source,metric,observed_at' });
  if (error) throw error;
  return rows.length;
}

/** SMAP L4 is 3-hourly: average each district's newest day with valid values. */
function smapRows(csv: Csv, fetchedAt: string) {
  const idCol = csv.header.indexOf('ID');
  const dateCol = csv.header.indexOf('Date');
  const layers = [
    { metric: 'soil_moisture_root', col: csv.header.findIndex(h => h.endsWith('sm_rootzone')) },
    { metric: 'soil_moisture_surface', col: csv.header.findIndex(h => h.endsWith('sm_surface')) },
  ];
  if (idCol < 0 || dateCol < 0 || layers.some(l => l.col < 0)) throw new Error('Unexpected SMAP CSV columns');

  // district → metric → day → values
  const acc = new Map<string, Map<string, Map<string, number[]>>>();
  for (const r of csv.rows) {
    const day = r[dateCol].slice(0, 10);
    for (const { metric, col } of layers) {
      const v = Number(r[col]);
      if (!Number.isFinite(v) || v < 0 || v > 1) continue;   // -9999 is "no data"
      const byMetric = acc.get(r[idCol]) ?? new Map();
      acc.set(r[idCol], byMetric);
      const byDay = byMetric.get(metric) ?? new Map();
      byMetric.set(metric, byDay);
      byDay.set(day, [...(byDay.get(day) ?? []), v]);
    }
  }

  const rows = [];
  for (const [district, byMetric] of acc) {
    for (const [metric, byDay] of byMetric) {
      const day = [...byDay.keys()].sort().pop()!;
      const values = byDay.get(day)!;
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      rows.push({ district_id: district, farm_id: null, source: 'smap', metric, value: Math.round(mean * 1000) / 1000, observed_at: day, fetched_at: fetchedAt });
    }
  }
  return rows;
}

// ---------------------------------------------------------------------------
// 2. Submit new tasks when due
// ---------------------------------------------------------------------------

async function submitDue(db: SupabaseClient, token: string): Promise<string[]> {
  const submitted: string[] = [];
  const recent = new Date(Date.now() - SMAP_EVERY_DAYS * 86_400_000).toISOString();
  // After a failure, wait a few hours before trying again.
  const backoff = new Date(Date.now() - ERROR_BACKOFF_HOURS * 3_600_000).toISOString();

  const [smapRuns, elevRuns, elevRows, districts] = await Promise.all([
    db.from('sync_runs').select('id').eq('job', 'appeears-smap').gte('started_at', recent)
      .or(`status.in.(pending,ok),and(status.eq.error,started_at.gte.${backoff})`).limit(1),
    db.from('sync_runs').select('id').eq('job', 'appeears-elevation')
      .or(`status.eq.pending,and(status.eq.error,started_at.gte.${backoff})`).limit(1),
    db.from('observations').select('district_id', { count: 'exact', head: true }).eq('source', 'nasadem').is('farm_id', null),
    db.from('districts').select('id, lat, lng'),
  ]);
  if (districts.error) throw districts.error;
  const coordinates = (districts.data as District[]).map(d => ({ id: d.id, latitude: d.lat, longitude: d.lng, category: 'district' }));

  if ((smapRuns.data ?? []).length === 0) {
    const product = await latestVersion('SPL4SMGP');
    const end = new Date(Date.now() - 86_400_000);
    const start = new Date(end.getTime() - SMAP_LOOKBACK_DAYS * 86_400_000);
    await submit(db, token, 'appeears-smap', {
      dates: [{ startDate: mdy(start), endDate: mdy(end) }],
      layers: [
        { product, layer: 'Geophysical_Data_sm_rootzone' },
        { product, layer: 'Geophysical_Data_sm_surface' },
      ],
      coordinates,
    });
    submitted.push(`appeears-smap (${product})`);
  }

  if ((elevRuns.data ?? []).length === 0 && (elevRows.count ?? 0) < coordinates.length) {
    const product = await latestVersion('NASADEM_NC');
    await submit(db, token, 'appeears-elevation', {
      dates: [{ startDate: '02-11-2000', endDate: '02-22-2000' }],   // the SRTM mission
      layers: [{ product, layer: 'NASADEM_HGT' }],
      coordinates,
    });
    submitted.push(`appeears-elevation (${product})`);
  }
  return submitted;
}

/** Starts a task and records it. A failure is recorded too, so the next try waits. */
async function submit(db: SupabaseClient, token: string, job: Job, params: Record<string, unknown>) {
  const body = { task_type: 'point', task_name: `agro-cosmic-weave-${job}-${new Date().toISOString().slice(0, 10)}`, params };
  try {
    const res = await (await api(token, '/task', { method: 'POST', body: JSON.stringify(body) })).json();
    if (!res.task_id) throw new Error(`AppEEARS did not return a task id: ${JSON.stringify(res).slice(0, 200)}`);
    const { error } = await db.from('sync_runs').insert({ job, status: 'pending', task_id: res.task_id });
    if (error) throw error;
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    await db.from('sync_runs').insert({ job, status: 'error', error: `Submit failed: ${message}`.slice(0, 2000), finished_at: new Date().toISOString() });
    throw e;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface Csv { header: string[]; rows: string[][] }

/** Small CSV reader that handles quoted fields. */
function parseCsv(text: string): Csv {
  const lines: string[][] = [];
  let row: string[] = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some(f => f !== '')) lines.push(row);
      row = [];
    } else field += c;
  }
  if (field !== '' || row.length) { row.push(field); lines.push(row); }
  return { header: lines[0] ?? [], rows: lines.slice(1) };
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
