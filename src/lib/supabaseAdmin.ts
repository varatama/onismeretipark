import { createClient } from '@supabase/supabase-js';

// Accessing Service Role Key safely.
// This should only be used in server-side API routes, never on client.

let adminInstance: any = null;

export const getSupabaseAdmin = () => {
    if (adminInstance) return adminInstance;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        // console.warn("Supabase Service Role Key missing");
    }

    // Central permissive cast: satisfy Supabase TS overloads where generated types are absent.
    adminInstance = createClient(supabaseUrl, serviceRoleKey) as any;
    return adminInstance as any;
};

export const supabaseAdmin = getSupabaseAdmin();
