import { supabase } from './supabaseClient';

export async function logEvent(action: string, meta: Record<string, unknown> = {}) {
  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    await fetch('/api/audit/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ action, meta })
    });
    } catch (err) {
    // ignore client-side analytics failures
    console.error('logEvent failed', err);
  }
}
