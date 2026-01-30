create extension if not exists "pgcrypto";

-- drop only our app tables
drop table if exists public.user_progress cascade;
drop table if exists public.experience_steps cascade;
drop table if exists public.experiences cascade;
drop table if exists public.onboarding cascade;
drop table if exists public.profiles cascade;
drop table if exists public.audit_logs cascade;

-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('user','admin')),
  plan text not null default 'free' check (plan in ('free','premium')),
  is_premium boolean not null default false,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ONBOARDING
create table public.onboarding (
  user_id uuid primary key references auth.users(id) on delete cascade,
  focus text,
  level text,
  daily_minutes int,
  completed boolean not null default false,
  updated_at timestamptz not null default now()
);

-- EXPERIENCES
create table public.experiences (
  id uuid primary key default gen_random_uuid(),
  order_index int not null default 0,
  title text not null,
  description text not null default '',
  duration_min int not null default 10,
  is_premium boolean not null default false,
  status text not null default 'published' check (status in ('draft','published','archived')),
  visibility text not null default 'free' check (visibility in ('free','premium','hidden')),
  difficulty text not null default 'easy' check (difficulty in ('easy','medium','hard')),
  cover_emoji text,
  cover_image_url text,
  created_at timestamptz not null default now()
);

create index experiences_order_idx on public.experiences(order_index);

-- EXPERIENCE STEPS
create table public.experience_steps (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references public.experiences(id) on delete cascade,
  order_index int not null default 0,
  title text not null,
  content text not null default '',
  step_type text not null default 'text' check (step_type in ('text','prompt','choice','breath', 'audio')),
  duration_sec int not null default 30,
  created_at timestamptz not null default now(),
  unique (experience_id, order_index)
);

create index experience_steps_exp_order_idx on public.experience_steps(experience_id, order_index);

-- USER PROGRESS
create table public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  experience_id uuid not null references public.experiences(id) on delete cascade,
  current_step int not null default 0,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (user_id, experience_id)
);

create index user_progress_user_idx on public.user_progress(user_id);

-- AUDIT LOGS
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.onboarding enable row level security;
alter table public.experiences enable row level security;
alter table public.experience_steps enable row level security;
alter table public.user_progress enable row level security;
alter table public.audit_logs enable row level security;

-- helper: admin check
create or replace function public.is_admin()
returns boolean
language sql stable
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- POLICIES: profiles
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

-- POLICIES: onboarding
create policy "onboarding_select_own" on public.onboarding for select using (auth.uid() = user_id);
create policy "onboarding_upsert_own" on public.onboarding for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- POLICIES: experiences
create policy "experiences_read_authed" on public.experiences for select using (auth.role() = 'authenticated');
create policy "experiences_write_admin" on public.experiences for all using (public.is_admin()) with check (public.is_admin());

-- POLICIES: steps
create policy "steps_read_authed" on public.experience_steps for select using (auth.role() = 'authenticated');
create policy "steps_write_admin" on public.experience_steps for all using (public.is_admin()) with check (public.is_admin());

-- POLICIES: progress
create policy "progress_crud_own" on public.user_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- TRIGGER: auto-create
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''), coalesce(new.raw_user_meta_data->>'avatar_url', ''))
  on conflict (id) do update set email = excluded.email, full_name = excluded.full_name, updated_at = now();
  insert into public.onboarding (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- FORCE CACHE REFRESH
comment on table public.experiences is 'Experiences table (v1.0)';
comment on table public.experience_steps is 'Steps for experiences (v1.0)';
comment on table public.profiles is 'User profiles (v1.0)';

-- NOTE: If any existing auth.users rows were created outside this DB's context
-- (for example in a different Supabase project or before migrations ran),
-- run the backfill migration `20240130000001_backfill_profiles_and_bootstrap_admin.sql` to ensure
-- `public.profiles` and `public.onboarding` rows exist for all `auth.users`.
