-- Add trial system columns to profiles
alter table public.profiles 
add column if not exists trial_expires_at timestamptz,
add column if not exists is_trial boolean not null default false,
add column if not exists soul_rider_name text,
add column if not exists pattern_map text default 'nature';

-- Update handle_new_user trigger to set trial for new users
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (
    id, 
    email, 
    full_name, 
    avatar_url,
    is_trial,
    trial_expires_at
  )
  values (
    new.id, 
    new.email, 
    coalesce(new.raw_user_meta_data->>'full_name', ''), 
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    true,
    now() + interval '7 days'
  )
  on conflict (id) do update set 
    email = excluded.email, 
    full_name = excluded.full_name, 
    updated_at = now();
    
  insert into public.onboarding (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end;
$$;
