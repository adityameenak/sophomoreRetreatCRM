-- =============================================================
-- Sophomore Retreat Sponsor CRM — Supabase Schema
-- Run this in the Supabase SQL editor to set up your database
-- =============================================================

-- ---------------------------------------------------------------
-- 1. PROFILES (extends auth.users)
-- ---------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  full_name   text,
  role        text not null default 'member' check (role in ('admin', 'co_admin', 'member')),
  avatar_url  text,
  created_at  timestamptz default now() not null
);

-- Auto-create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ---------------------------------------------------------------
-- 2. COMPANIES
-- ---------------------------------------------------------------
create table if not exists public.companies (
  id                          uuid primary key default gen_random_uuid(),
  company_name                text not null,
  industry                    text,
  website                     text,
  internal_owner              uuid references public.profiles(id) on delete set null,
  target_sponsorship_level    text not null default 'none'
                                check (target_sponsorship_level in ('none','in_discussion','bronze','silver','gold','custom')),
  confirmed_sponsorship_level text not null default 'none'
                                check (confirmed_sponsorship_level in ('none','in_discussion','bronze','silver','gold','custom')),
  outreach_status             text not null default 'not_started'
                                check (outreach_status in ('not_started','ready_to_contact','contacted','follow_up_sent','interested','confirmed','declined','on_hold')),
  first_contact_date          date,
  last_contact_date           date,
  next_follow_up_date         date,
  documents_sent              text[]   default '{}',
  tags                        text[]   default '{}',
  notes_preview               text,
  created_at                  timestamptz default now() not null,
  updated_at                  timestamptz default now() not null
);

-- updated_at trigger
create or replace function public.update_updated_at()
returns trigger language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists companies_updated_at on public.companies;
create trigger companies_updated_at
  before update on public.companies
  for each row execute function public.update_updated_at();


-- ---------------------------------------------------------------
-- 3. CONTACTS
-- ---------------------------------------------------------------
create table if not exists public.contacts (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  name        text not null,
  title       text,
  email       text,
  phone       text,
  is_primary  boolean not null default false,
  created_at  timestamptz default now() not null
);

-- Only one primary contact per company (enforced via partial unique index)
create unique index if not exists contacts_one_primary_per_company
  on public.contacts (company_id)
  where is_primary = true;


-- ---------------------------------------------------------------
-- 4. NOTES
-- ---------------------------------------------------------------
create table if not exists public.notes (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  author_id   uuid references public.profiles(id) on delete set null,
  content     text not null,
  created_at  timestamptz default now() not null
);


-- ---------------------------------------------------------------
-- 5. COMPANY ACTIVITIES
-- ---------------------------------------------------------------
create table if not exists public.company_activities (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  type        text not null,
  description text not null,
  created_by  uuid references public.profiles(id) on delete set null,
  metadata    jsonb,
  created_at  timestamptz default now() not null
);


-- ---------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS)
-- All tables are readable + writable by any authenticated user.
-- Tighten by role in a future iteration if needed.
-- ---------------------------------------------------------------

alter table public.profiles         enable row level security;
alter table public.companies        enable row level security;
alter table public.contacts         enable row level security;
alter table public.notes            enable row level security;
alter table public.company_activities enable row level security;

-- Profiles
create policy "Authenticated users can view all profiles"
  on public.profiles for select using (auth.role() = 'authenticated');

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- Companies
create policy "Authenticated users can view companies"
  on public.companies for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert companies"
  on public.companies for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update companies"
  on public.companies for update using (auth.role() = 'authenticated');

create policy "Authenticated users can delete companies"
  on public.companies for delete using (auth.role() = 'authenticated');

-- Contacts
create policy "Authenticated users can view contacts"
  on public.contacts for select using (auth.role() = 'authenticated');

create policy "Authenticated users can manage contacts"
  on public.contacts for all using (auth.role() = 'authenticated');

-- Notes
create policy "Authenticated users can view notes"
  on public.notes for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert notes"
  on public.notes for insert with check (auth.role() = 'authenticated');

create policy "Authors can delete their own notes"
  on public.notes for delete using (auth.uid() = author_id);

-- Activities
create policy "Authenticated users can view activities"
  on public.company_activities for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert activities"
  on public.company_activities for insert with check (auth.role() = 'authenticated');


-- ---------------------------------------------------------------
-- 7. SEED DATA (optional — comment out in production)
-- ---------------------------------------------------------------
-- After signing up, manually set yourself as admin:
--   update public.profiles set role = 'admin' where id = '<your-user-id>';
--   update public.profiles set role = 'co_admin' where id = '<shepards-user-id>';


-- ---------------------------------------------------------------
-- 8. HELPFUL INDEXES
-- ---------------------------------------------------------------
create index if not exists companies_outreach_status_idx on public.companies (outreach_status);
create index if not exists companies_next_follow_up_idx on public.companies (next_follow_up_date);
create index if not exists companies_updated_at_idx on public.companies (updated_at desc);
create index if not exists activities_company_id_idx on public.company_activities (company_id, created_at desc);
create index if not exists notes_company_id_idx on public.notes (company_id, created_at desc);
