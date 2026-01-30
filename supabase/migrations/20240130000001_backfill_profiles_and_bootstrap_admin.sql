-- Backfill missing profiles and onboarding rows for existing auth.users
-- Idempotent; safe to run multiple times

BEGIN;

-- 1) Backfill profiles for auth.users that lack a profile row
INSERT INTO public.profiles (id, email, full_name, avatar_url, created_at, updated_at)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', ''),
  COALESCE(u.raw_user_meta_data->>'avatar_url', ''),
  now(), now()
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;

-- 2) Backfill onboarding rows for auth.users that lack an onboarding row
INSERT INTO public.onboarding (user_id, focus, level, daily_minutes, completed, updated_at)
SELECT
  u.id,
  NULL,
  NULL,
  10,
  false,
  now()
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.onboarding o WHERE o.user_id = u.id
)
ON CONFLICT (user_id) DO NOTHING;

COMMIT;

-- 3) Bootstrap function to promote first admin by email
-- Usage: SELECT public.bootstrap_first_admin('admin@example.com');
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin(p_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int;
  v_user_id uuid;
BEGIN
  -- Only allow if there are ZERO admins currently
  SELECT COUNT(1) INTO v_count FROM public.profiles WHERE role = 'admin';
  IF v_count > 0 THEN
    RAISE EXCEPTION 'admin already exists';
  END IF;

  -- Find auth user by email (case-insensitive)
  SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = lower(p_email) LIMIT 1;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'auth user with email % not found', p_email;
  END IF;

  -- Ensure profile exists for that user (safe because auth.users row must exist)
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role, plan, is_premium, created_at, updated_at)
  SELECT u.id, u.email, COALESCE(u.raw_user_meta_data->>'full_name',''), COALESCE(u.raw_user_meta_data->>'avatar_url',''), 'admin', 'free', false, now(), now()
  FROM auth.users u
  WHERE u.id = v_user_id
  ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, email = EXCLUDED.email, updated_at = now();

  -- Final safety: ensure exactly one admin now exists
  SELECT COUNT(1) INTO v_count FROM public.profiles WHERE role = 'admin';
  IF v_count = 0 THEN
    RAISE EXCEPTION 'failed to create admin for %', p_email;
  END IF;

  RETURN;
END;
$$;

-- set function owner to postgres (optional, will be owner of the migration executor)
-- NOTE: SECURITY DEFINER will run as the function owner; ensure migrations are applied by a privileged role (service role)
