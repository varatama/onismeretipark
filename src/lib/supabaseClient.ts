import { createBrowserClient } from '@supabase/ssr';
import { getPublicEnv } from './env';

const env = getPublicEnv();

// Browser client using @supabase/ssr for proper PKCE and cookie handling
export const supabase = createBrowserClient(
    env.url || 'https://placeholder.supabase.co',
    env.key || 'placeholder'
);

// Backward compatibility
export const supabaseBrowser = supabase;

export async function checkSupabaseConnection() {
    if (!env.valid) return { ok: false, error: "Hiányzó Supabase konfiguráció (ENV)." };

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const response = await fetch(`${env.url}/auth/v1/health`, {
            method: 'GET',
            headers: { 'apikey': env.key },
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) return { ok: true };
        return { ok: false, error: "A Supabase szolgáltatás válaszol, de hiba történt." };
    } catch {
        return { ok: false, error: "A Supabase URL nem elérhető (DNS vagy hálózati hiba)." };
    }
}
