import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type { Database } from '@/lib/database.types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;

async function getUserFromToken(req: Request) {
    const auth = req.headers.get('authorization') || '';
    const m = auth.match(/^Bearer\s+(.*)$/i);
    const token = m ? m[1] : null;
    if (!token) return null;
    const client = createClient(SUPABASE_URL, token);
    const { data } = await client.auth.getUser();
    return data?.user || null;
}

async function requireAdmin(req: Request) {
    const user = await getUserFromToken(req);
    if (!user) return { ok: false, status: 401, body: { error: 'Unauthorized' } };

    const profileRes = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).maybeSingle();
    const profile = profileRes?.data as Database['public']['Tables']['profiles']['Row'] | null;
    if (!profile || profile.role !== 'admin') return { ok: false, status: 403, body: { error: 'Forbidden' } };
    return { ok: true, user };
}

export async function GET(req: Request) {
    const auth = await requireAdmin(req);
    if (!auth.ok) return NextResponse.json(auth.body, { status: auth.status });

    const { data, error } = await supabaseAdmin.from('profiles').select('id, email, role, plan, is_premium, created_at').order('email', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data || []);
}

export async function PATCH(req: Request) {
    const auth = await requireAdmin(req);
    if (!auth.ok) return NextResponse.json(auth.body, { status: auth.status });

    const body = await req.json();
    const { id, role } = body || {};
    if (!id || !role) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabaseAdmin as any)
        .from('profiles')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}
