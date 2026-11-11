-- Agro Cosmic Weave: one farm per account, a "latest value" view for observations,
-- and keeping elevation data (it never changes) out of the cleanup.

-- Safe to run more than once.

-- The app has one farm per person. This also lets the app save with a simple upsert.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'farms_user_id_key') then
    alter table public.farms add constraint farms_user_id_key unique (user_id);
  end if;
end $$;

-- Keep farms.updated_at current.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists farms_touch_updated_at on public.farms;
create trigger farms_touch_updated_at
  before update on public.farms
  for each row execute function public.touch_updated_at();

-- Newest value of every metric, per district or farm. security_invoker makes the
-- view follow the observations table's access rules.
create or replace view public.latest_observations
with (security_invoker = true) as
select distinct on (district_id, farm_id, source, metric)
  district_id, farm_id, source, metric, value, observed_at, fetched_at
from public.observations
order by district_id, farm_id, source, metric, observed_at desc;

grant select on public.latest_observations to anon, authenticated;

-- Elevation does not change, so never delete it.
create or replace function public.prune_observations()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.observations
  where observed_at < current_date - interval '84 days' and source <> 'nasadem';
  delete from public.predictions where valid_until < current_date - interval '7 days';
$$;
revoke execute on function public.prune_observations() from public, anon, authenticated;
