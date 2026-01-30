import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Accessing Service Role Key safely.
// This should only be used in server-side API routes, never on client.

let adminInstance: SupabaseClient<Database> | null = null;

export const getSupabaseAdmin = (): SupabaseClient<Database> => {
    if (adminInstance) return adminInstance;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        // console.warn("Supabase Service Role Key missing");
    }

    adminInstance = createClient<Database>(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
    return adminInstance;
};

export const supabaseAdmin = getSupabaseAdmin();
