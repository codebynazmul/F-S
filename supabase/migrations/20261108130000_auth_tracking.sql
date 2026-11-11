-- Agro Cosmic Weave: sign-in tracking for the admin panel, activity log writes,
-- and locking blocked users out of their data.

-- ---------------------------------------------------------------------------
-- Sign-in details on profiles (kept up to date from auth.users)
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column provider        text not null default 'email',   -- 'email' or 'google'
  add column last_sign_in_at timestamptz,
  add column sign_in_count   integer not null default 0;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name, email, provider, last_sign_in_at, sign_in_count)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    new.email,
    coalesce(new.raw_app_meta_data ->> 'provider', 'email'),
    new.last_sign_in_at,
    case when new.last_sign_in_at is null then 0 else 1 end
  );
  return new;
end;
$$;

-- Supabase Auth sets last_sign_in_at on every sign-in.
create function public.handle_user_sign_in()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set last_sign_in_at = new.last_sign_in_at,
      sign_in_count   = sign_in_count + 1,
      provider        = coalesce(new.raw_app_meta_data ->> 'provider', provider),
      email           = new.email
  where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_signed_in
  after update of last_sign_in_at on auth.users
  for each row
  when (new.last_sign_in_at is distinct from old.last_sign_in_at)
  execute function public.handle_user_sign_in();

-- Fill in accounts created before this migration.
update public.profiles p
set provider        = coalesce(u.raw_app_meta_data ->> 'provider', 'email'),
    last_sign_in_at = u.last_sign_in_at,
    sign_in_count   = case when u.last_sign_in_at is null then 0 else 1 end
from auth.users u
where u.id = p.id;

-- Users may edit only their name, phone and language. Everything else is set by
-- the system or by an admin.
create or replace function public.guard_profile_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if auth.uid() is not null and not public.is_admin() and (
       new.role            is distinct from old.role
    or new.blocked         is distinct from old.blocked
    or new.email           is distinct from old.email
    or new.provider        is distinct from old.provider
    or new.last_sign_in_at is distinct from old.last_sign_in_at
    or new.sign_in_count   is distinct from old.sign_in_count
  ) then
    raise exception 'You can only change your name, phone and language';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Activity log: admins write their own entries and may clear the log
-- ---------------------------------------------------------------------------
create policy "activity_log: admin insert own" on public.activity_log
  for insert to authenticated
  with check ((select public.is_admin()) and actor_id = (select auth.uid()));
create policy "activity_log: admin delete" on public.activity_log
  for delete to authenticated using ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Blocked users lose access to their farms and plans
-- ---------------------------------------------------------------------------
create function public.is_blocked()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select blocked from public.profiles where id = auth.uid()), false);
$$;

drop policy "farms: owner all" on public.farms;
create policy "farms: owner all" on public.farms
  for all to authenticated
  using (user_id = (select auth.uid()) and not (select public.is_blocked()))
  with check (user_id = (select auth.uid()) and not (select public.is_blocked()));

drop policy "plans: owner all" on public.plans;
create policy "plans: owner all" on public.plans
  for all to authenticated
  using (public.owns_farm(farm_id) and not (select public.is_blocked()))
  with check (public.owns_farm(farm_id) and not (select public.is_blocked()));
