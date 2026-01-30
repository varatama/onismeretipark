import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

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

    const { data: profile } = await (supabaseAdmin.from('profiles') as any)
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
    if (!profile || (profile as any).role !== 'admin') return { ok: false, status: 403, body: { error: 'Forbidden' } };
    return { ok: true, user };
}

export async function GET(req: Request) {
    const auth = await requireAdmin(req);
    if (!auth.ok) return NextResponse.json(auth.body, { status: auth.status });

    const { data, error } = await (supabaseAdmin.from('profiles') as any)
        .select('id, email, role, plan, is_premium, created_at')
        .order('email', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data || []);
}

export async function PATCH(req: Request) {
    const auth = await requireAdmin(req);
    if (!auth.ok) return NextResponse.json(auth.body, { status: auth.status });

    const url = new URL(req.url);
    const body = await req.json();
    const { id, role } = body || {};
    if (!id || !role) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

    const { error } = await (supabaseAdmin.from('profiles') as any)
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}
