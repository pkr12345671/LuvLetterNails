-- ============================================================================
-- Luv Letter — booking backend schema (Supabase / Postgres)
-- Run this once in your Supabase project: Dashboard → SQL Editor → paste → Run.
-- Safe to re-run (uses IF NOT EXISTS / CREATE OR REPLACE).
-- ============================================================================

-- gist exclusion constraints over ranges need this extension
create extension if not exists btree_gist;

-- ---------------------------------------------------------------------------
-- profiles: one row per signed-in user (clients + the artist/admin)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  phone       text,
  email       text,
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- bookings: one row per appointment request/booking
-- ---------------------------------------------------------------------------
create table if not exists public.bookings (
  id             uuid primary key default gen_random_uuid(),
  -- references profiles (not auth.users) so the admin view can join client
  -- name/phone; a profile row is always created before a booking is inserted.
  user_id        uuid not null references public.profiles(id) on delete cascade,
  service_name   text not null,
  addons         jsonb not null default '[]'::jsonb,
  start_ts       timestamptz not null,
  end_ts         timestamptz not null,
  price_estimate text,
  notes          text,
  status         text not null default 'pending'
                   check (status in ('pending','confirmed','cancelled')),
  deposit_paid   boolean not null default false,
  created_at     timestamptz not null default now(),
  constraint end_after_start check (end_ts > start_ts),
  -- 🔒 the heart of "no double-booking": two non-cancelled bookings can never
  -- occupy overlapping time. Postgres enforces this atomically, even in a race.
  constraint no_overlap exclude using gist (
    tstzrange(start_ts, end_ts) with &&
  ) where (status <> 'cancelled')
);
create index if not exists bookings_start_idx on public.bookings (start_ts);

-- ---------------------------------------------------------------------------
-- blackouts: time the artist blocks off (vacation, breaks, personal)
-- ---------------------------------------------------------------------------
create table if not exists public.blackouts (
  id          uuid primary key default gen_random_uuid(),
  start_ts    timestamptz not null,
  end_ts      timestamptz not null,
  reason      text,
  created_at  timestamptz not null default now(),
  constraint blackout_end_after_start check (end_ts > start_ts)
);

-- ---------------------------------------------------------------------------
-- helper: is the current request from an admin?  (used by RLS policies)
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- ---------------------------------------------------------------------------
-- busy_slots: ONLY start/end times of taken/blocked time (no names, no PII).
-- Anyone (even logged-out visitors) may read this so the calendar can show
-- availability. Runs as the view owner, so it bypasses the bookings RLS while
-- exposing nothing but timestamps.
-- ---------------------------------------------------------------------------
create or replace view public.busy_slots as
  select start_ts, end_ts from public.bookings where status <> 'cancelled'
  union all
  select start_ts, end_ts from public.blackouts;

grant select on public.busy_slots to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Row-Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles  enable row level security;
alter table public.bookings  enable row level security;
alter table public.blackouts enable row level security;

-- profiles: you can see/edit your own row; admin can see all
drop policy if exists "profiles read"   on public.profiles;
drop policy if exists "profiles insert" on public.profiles;
drop policy if exists "profiles update" on public.profiles;
create policy "profiles read"   on public.profiles for select
  using (id = auth.uid() or public.is_admin());
create policy "profiles insert" on public.profiles for insert
  with check (id = auth.uid());
create policy "profiles update" on public.profiles for update
  using (id = auth.uid() or public.is_admin());

-- bookings: clients manage their own; admin manages all
drop policy if exists "bookings read"   on public.bookings;
drop policy if exists "bookings insert" on public.bookings;
drop policy if exists "bookings update" on public.bookings;
drop policy if exists "bookings delete" on public.bookings;
create policy "bookings read"   on public.bookings for select
  using (user_id = auth.uid() or public.is_admin());
create policy "bookings insert" on public.bookings for insert
  with check (user_id = auth.uid());
create policy "bookings update" on public.bookings for update
  using (user_id = auth.uid() or public.is_admin());
create policy "bookings delete" on public.bookings for delete
  using (public.is_admin());

-- blackouts: only the admin can read/write
drop policy if exists "blackouts admin" on public.blackouts;
create policy "blackouts admin" on public.blackouts for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- After running this:
--   1) Sign in once on the site (so your auth user + profile row exist).
--   2) Make yourself admin:
--        update public.profiles set is_admin = true where email = 'YOUR@EMAIL';
--   3) Realtime: Dashboard → Database → Replication → enable for `bookings`
--      (lets an open calendar update live when a slot is taken).
-- ============================================================================
