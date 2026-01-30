/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const auth = req.headers.get('authorization') || '';
    const token = auth.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: userData, error: userErr } = await getSupabaseAdmin().auth.getUser(token);
    if (userErr || !userData?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = userData.user;
    const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL;
    if (!adminEmail) return NextResponse.json({ error: 'ADMIN_BOOTSTRAP_EMAIL not configured' }, { status: 500 });

    if ((user.email ?? '').toLowerCase() !== adminEmail.toLowerCase()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Upsert profile role to admin (use array to satisfy typings)
    await getSupabaseAdmin()
      .from('profiles')
      .upsert([
        { id: user.id, email: user.email, role: 'admin', updated_at: new Date().toISOString() }
      ] as any);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Bootstrap admin error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
