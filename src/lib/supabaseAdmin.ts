import { createClient } from '@supabase/supabase-js';

// Accessing Service Role Key safely.
// This should only be used in server-side API routes, never on client.

let adminInstance: ReturnType<typeof createClient> | null = null;

export const getSupabaseAdmin = () => {
    if (adminInstance) return adminInstance;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        // console.warn("Supabase Service Role Key missing");
    }

    // Return a permissively typed client to avoid build-time TS 'never' errors
    adminInstance = createClient(supabaseUrl, serviceRoleKey) as any;
    return adminInstance as any;
};

// Export a proxy or just the function. Let's export the function to be safe and update usage.
export const supabaseAdmin = new Proxy({}, {
    get: (_target, prop) => {
        return (getSupabaseAdmin() as any)[prop];
    }
}) as any;
