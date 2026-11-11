-- Agro Cosmic Weave: schedule the NASA sync functions and the observation cleanup.
-- Run in the Supabase SQL editor AFTER deploying the functions. Safe to run again.
-- Replace the two values in step 2 first. Do not commit your real values.

-- 1. Extensions for scheduling and HTTP calls.
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 2. Store the project URL and the shared secret in Vault (encrypted).
--    The secret must be the same value you set with: supabase secrets set CRON_SECRET=...
--    To change a value later, delete it in Dashboard → Project Settings → Vault and run this again.
do $$
begin
  if not exists (select 1 from vault.secrets where name = 'project_url') then
    perform vault.create_secret('https://YOUR-PROJECT-REF.supabase.co', 'project_url');
  end if;
  if not exists (select 1 from vault.secrets where name = 'cron_secret') then
    perform vault.create_secret('YOUR-CRON-SECRET', 'cron_secret');
  end if;
end $$;

-- 3. One helper that calls an Edge Function with the secret. Only the scheduler uses it.
create or replace function public.call_edge_function(fn text)
returns bigint
language sql
security definer
set search_path = ''
as $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/' || fn,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 120000
  );
$$;
revoke execute on function public.call_edge_function(text) from public, anon, authenticated;

-- 4. Schedules (UTC; Bangladesh is UTC+6). Scheduling a name again replaces it.
--    NASA POWER: every 10 min, 00:00–02:59. 8 districts per call.
select cron.schedule('sync-power', '*/10 0-2 * * *', $$ select public.call_edge_function('sync-power'); $$);
--    MODIS: every 10 min, 03:00–05:59. 6 district/product pairs per call, refreshed weekly.
select cron.schedule('sync-modis', '*/10 3-5 * * *', $$ select public.call_edge_function('sync-modis'); $$);
--    AppEEARS: hourly. Collects finished tasks and starts new ones when due.
select cron.schedule('sync-appeears', '40 * * * *', $$ select public.call_edge_function('sync-appeears'); $$);
--    Risk predictions: daily at 06:15, after the morning syncs.
select cron.schedule('predict-risk', '15 6 * * *', $$ select public.call_edge_function('predict-risk'); $$);
--    Cleanup: delete observations older than about 12 weeks (elevation is kept).
select cron.schedule('prune-observations', '30 3 * * *', $$ select public.prune_observations(); $$);

-- Check the jobs:      select jobname, schedule, active from cron.job;
-- See recent runs:     select job, status, rows_updated, error, started_at from public.sync_runs order by started_at desc limit 20;
-- Run one now:         select public.call_edge_function('predict-risk');
-- Remove a job:        select cron.unschedule('sync-modis');
