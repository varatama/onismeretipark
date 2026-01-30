/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const auth = req.headers.get('authorization') || '';
    const token = auth.replace('Bearer ', '');

    // optional auth: try to resolve user, but allow anonymous logs
    let userId: string | null = null;
    if (token) {
      try {
        const { data: userData } = await getSupabaseAdmin().auth.getUser(token);
        if (userData?.user) userId = userData.user.id;
      } catch {
        // ignore
      }
    }

    const body = await req.json();
    const { action, meta } = body as { action: string; meta?: Record<string, unknown> };
    if (!action) return NextResponse.json({ error: 'Missing action' }, { status: 400 });

    const supabaseAdmin = getSupabaseAdmin();
    const clientAny = supabaseAdmin as any;
    await clientAny.from('audit_logs').insert({ user_id: userId, action, meta: meta ?? {}, created_at: new Date().toISOString() } as any);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Audit log API error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
