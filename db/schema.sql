-- PostgreSQL schema for FeelGood Friday journaling data.
-- Intended for Supabase Postgres with Clerk third-party auth.

create extension if not exists pgcrypto;

create or replace function requesting_clerk_user_id()
returns text
language sql
stable
as $$
  select nullif(auth.jwt()->>'sub', '');
$$;

create table if not exists app_users (
  clerk_user_id text primary key default requesting_clerk_user_id(),
  first_name text,
  last_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists journal_weeks (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null default requesting_clerk_user_id() references app_users(clerk_user_id) on delete cascade,
  week_start_date date not null,
  week_end_date date generated always as (week_start_date + 4) stored,
  status text not null default 'active' check (status in ('active', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (clerk_user_id, week_start_date)
);

create table if not exists journal_entries (
  id uuid primary key default gen_random_uuid(),
  week_id uuid not null references journal_weeks(id) on delete cascade,
  clerk_user_id text not null default requesting_clerk_user_id() references app_users(clerk_user_id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 1 and 5),
  entry_type text not null check (entry_type in ('win', 'gratitude')),
  content text not null,
  entered_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists journal_weeks_user_week_start_idx
  on journal_weeks (clerk_user_id, week_start_date desc);

create index if not exists journal_entries_week_day_type_idx
  on journal_entries (week_id, day_of_week, entry_type, entered_at);

create index if not exists journal_entries_user_entered_at_idx
  on journal_entries (clerk_user_id, entered_at desc);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists app_users_set_updated_at on app_users;
create trigger app_users_set_updated_at
before update on app_users
for each row
execute function set_updated_at();

drop trigger if exists journal_weeks_set_updated_at on journal_weeks;
create trigger journal_weeks_set_updated_at
before update on journal_weeks
for each row
execute function set_updated_at();

drop trigger if exists journal_entries_set_updated_at on journal_entries;
create trigger journal_entries_set_updated_at
before update on journal_entries
for each row
execute function set_updated_at();

comment on table app_users is
  'Local profile snapshot keyed by Clerk user ID.';

comment on table journal_weeks is
  'One row per user per work week.';

comment on table journal_entries is
  'One row per gratitude or win entry.';

alter table app_users enable row level security;
alter table journal_weeks enable row level security;
alter table journal_entries enable row level security;

drop policy if exists "Users can manage own profile" on app_users;
create policy "Users can manage own profile"
on app_users
for all
to authenticated
using ((select requesting_clerk_user_id()) = clerk_user_id)
with check ((select requesting_clerk_user_id()) = clerk_user_id);

drop policy if exists "Users can manage own weeks" on journal_weeks;
create policy "Users can manage own weeks"
on journal_weeks
for all
to authenticated
using ((select requesting_clerk_user_id()) = clerk_user_id)
with check ((select requesting_clerk_user_id()) = clerk_user_id);

drop policy if exists "Users can manage own entries" on journal_entries;
create policy "Users can manage own entries"
on journal_entries
for all
to authenticated
using ((select requesting_clerk_user_id()) = clerk_user_id)
with check ((select requesting_clerk_user_id()) = clerk_user_id);
