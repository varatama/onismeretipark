import { supabase } from './supabaseClient';
import { getOrSyncProfile, Profile } from './user';
import type { User } from '@supabase/supabase-js';

type UserWithProfile = {
  user: User | null;
  profile: Profile | null;
};

let cached: UserWithProfile | null = null;
let lastFetch = 0;
const CACHE_TTL = 5 * 1000; // 5s cache

export async function getCurrentUserWithProfile(): Promise<UserWithProfile> {
  const now = Date.now();
  if (cached && (now - lastFetch) < CACHE_TTL) return cached;

  const { data } = await supabase.auth.getUser();
  const user = data?.user || null;
  let profile: Profile | null = null;
  if (user) {
    profile = await getOrSyncProfile(user.id);
  }

  cached = { user, profile };
  lastFetch = Date.now();
  return cached;
}

export function clearUserCache() {
  cached = null;
  lastFetch = 0;
}
