-- Agro Cosmic Weave: initial schema.
-- Flow: NASA APIs -> Edge Functions -> these tables. Only processed values are stored.
-- Edge Functions write with the service key, which bypasses RLS, so most NASA tables
-- have read policies only.

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('farmer', 'admin');
create type public.soil_texture as enum ('sand', 'sandy_loam', 'loam', 'silt_loam', 'clay_loam', 'clay', 'peat');
create type public.irrigation_type as enum ('deep_tw', 'shallow_tw', 'canal', 'rainfed');
create type public.risk_level as enum ('low', 'medium', 'high');

-- ---------------------------------------------------------------------------
-- Users
-- ---------------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  name        text not null default '',
  email       text,
  phone       text,
  language    text not null default 'en' check (language in ('en', 'bn')),
  role        public.user_role not null default 'farmer',
  blocked     boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- True when the signed-in user is an admin. SECURITY DEFINER so policies on
-- profiles can call it without recursing into themselves.
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and not blocked
  );
$$;

-- Create a profile for every new sign-up (email or Google).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Signed-in users may edit their own profile, but not their role or blocked flag.
-- Admins, the service key (Edge Functions) and the SQL editor have no such limit.
create function public.guard_profile_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if auth.uid() is not null and not public.is_admin()
     and (new.role is distinct from old.role or new.blocked is distinct from old.blocked) then
    raise exception 'Only an admin can change role or blocked';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger guard_profile_update
  before update on public.profiles
  for each row execute function public.guard_profile_update();

-- ---------------------------------------------------------------------------
-- Reference data
-- ---------------------------------------------------------------------------
create table public.districts (
  id         text primary key,          -- e.g. 'dhaka', same ids as data/districts.ts
  name       text not null,
  name_bn    text not null,
  division   text not null,
  lat        double precision not null,
  lng        double precision not null,
  soil       text not null,
  rainfall   numeric not null,          -- baseline annual mm
  temp       numeric not null,          -- baseline mean °C
  risk       text not null,
  risk_bn    text not null
);

-- 30-year NASA POWER averages, one row per district.
create table public.climate_normals (
  district_id      text primary key references public.districts (id) on delete cascade,
  monthly_rain_mm  numeric[] not null check (cardinality(monthly_rain_mm) = 12),
  monthly_wetness  numeric[] not null check (cardinality(monthly_wetness) = 12),
  annual_rain_mm   numeric not null,
  temp_mean        numeric not null,
  humidity         numeric,
  solar_mj         numeric,
  root_wetness     numeric,
  et0_mm_day       numeric,
  fetched_at       timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Farms and plans
-- ---------------------------------------------------------------------------
create table public.farms (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles (id) on delete cascade,
  district_id     text not null references public.districts (id),
  size_bigha      numeric not null check (size_bigha > 0),
  texture         public.soil_texture not null,
  ph              numeric not null check (ph between 0 and 14),
  organic_matter  numeric not null check (organic_matter >= 0),
  irrigation      public.irrigation_type not null,
  lat             double precision,
  lng             double precision,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index farms_user_id_idx on public.farms (user_id);

create table public.plans (
  id                uuid primary key default gen_random_uuid(),
  farm_id           uuid not null references public.farms (id) on delete cascade,
  plan              jsonb not null,     -- crop ids per season
  risks             jsonb not null,
  climate_snapshot  jsonb,              -- the climate values the plan was built from
  created_at        timestamptz not null default now()
);
create index plans_farm_id_idx on public.plans (farm_id);

create function public.owns_farm(farm uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.farms where id = farm and user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- NASA observations and predictions (processed values only)
-- ---------------------------------------------------------------------------
create table public.observations (
  id           uuid primary key default gen_random_uuid(),
  district_id  text references public.districts (id) on delete cascade,
  farm_id      uuid references public.farms (id) on delete cascade,
  source       text not null check (source in ('power', 'modis', 'smap', 'hls', 'ecostress', 'nasadem', 'gpm', 'grace')),
  metric       text not null,           -- e.g. 'rain_30d_mm', 'ndvi', 'soil_moisture'
  value        numeric not null,
  observed_at  date not null,
  fetched_at   timestamptz not null default now(),
  check (district_id is not null or farm_id is not null),
  unique nulls not distinct (district_id, farm_id, source, metric, observed_at)
);
create index observations_district_idx on public.observations (district_id, metric, observed_at desc);
create index observations_farm_idx on public.observations (farm_id, metric, observed_at desc);

-- Latest prediction per kind; the predict function overwrites it.
create table public.predictions (
  id             uuid primary key default gen_random_uuid(),
  district_id    text references public.districts (id) on delete cascade,
  farm_id        uuid references public.farms (id) on delete cascade,
  kind           text not null check (kind in ('drought', 'flood', 'heat', 'frost', 'salinity', 'crop_stress')),
  level          public.risk_level not null,
  score          numeric check (score between 0 and 1),
  valid_until    date not null,
  computed_at    timestamptz not null default now(),
  check (district_id is not null or farm_id is not null),
  unique nulls not distinct (district_id, farm_id, kind)
);
create index predictions_farm_idx on public.predictions (farm_id);

-- Keep only about 12 weeks of observations. Scheduled later with pg_cron.
create function public.prune_observations()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.observations where observed_at < current_date - interval '84 days';
  delete from public.predictions where valid_until < current_date - interval '7 days';
$$;
revoke execute on function public.prune_observations() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Admin
-- ---------------------------------------------------------------------------
create table public.sync_runs (
  id            uuid primary key default gen_random_uuid(),
  job           text not null,          -- e.g. 'sync-power', 'appeears-collect'
  status        text not null default 'running' check (status in ('running', 'pending', 'ok', 'error')),
  task_id       text,                   -- AppEEARS task id
  rows_updated  integer not null default 0,
  error         text,
  started_at    timestamptz not null default now(),
  finished_at   timestamptz
);
create index sync_runs_started_idx on public.sync_runs (started_at desc);

create table public.activity_log (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references public.profiles (id) on delete set null,
  action      text not null,            -- matches AdminAction in lib/types.ts
  target      text,
  created_at  timestamptz not null default now()
);
create index activity_log_created_idx on public.activity_log (created_at desc);

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------
alter table public.profiles        enable row level security;
alter table public.districts       enable row level security;
alter table public.climate_normals enable row level security;
alter table public.farms           enable row level security;
alter table public.plans           enable row level security;
alter table public.observations    enable row level security;
alter table public.predictions     enable row level security;
alter table public.sync_runs       enable row level security;
alter table public.activity_log    enable row level security;

-- profiles: see and edit your own; admins see and edit all.
create policy "profiles: read own or admin" on public.profiles
  for select to authenticated using (id = (select auth.uid()) or (select public.is_admin()));
create policy "profiles: update own or admin" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()))
  with check (id = (select auth.uid()) or (select public.is_admin()));

-- reference data: public read.
create policy "districts: public read" on public.districts
  for select to anon, authenticated using (true);
create policy "climate_normals: public read" on public.climate_normals
  for select to anon, authenticated using (true);

-- farms: owner has full access; admins can read.
create policy "farms: owner all" on public.farms
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "farms: admin read" on public.farms
  for select to authenticated using ((select public.is_admin()));

-- plans: through the farm owner; admins can read.
create policy "plans: owner all" on public.plans
  for all to authenticated
  using (public.owns_farm(farm_id))
  with check (public.owns_farm(farm_id));
create policy "plans: admin read" on public.plans
  for select to authenticated using ((select public.is_admin()));

-- observations / predictions: district rows are public, farm rows are owner-only.
create policy "observations: read" on public.observations
  for select to anon, authenticated
  using (farm_id is null or public.owns_farm(farm_id) or (select public.is_admin()));
create policy "predictions: read" on public.predictions
  for select to anon, authenticated
  using (farm_id is null or public.owns_farm(farm_id) or (select public.is_admin()));

-- admin tables.
create policy "sync_runs: admin read" on public.sync_runs
  for select to authenticated using ((select public.is_admin()));
create policy "activity_log: admin read" on public.activity_log
  for select to authenticated using ((select public.is_admin()));
