/* eslint-disable @typescript-eslint/no-explicit-any */
import { getSupabaseAdmin } from './supabaseAdmin';

export async function logAudit(action: string, meta: Record<string, unknown> = {}, userId?: string | null) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const clientAny = supabaseAdmin as any;
    await clientAny
      .from('audit_logs')
      .insert({ user_id: userId ?? null, action, meta, created_at: new Date().toISOString() } as any);
  } catch (err) {
    // swallow logging errors but print to server logs
    console.error('Audit log failed', err);
  }
}
