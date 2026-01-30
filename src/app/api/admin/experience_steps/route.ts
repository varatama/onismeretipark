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

    const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (!profile || profile.role !== 'admin') return { ok: false, status: 403, body: { error: 'Forbidden' } };
    return { ok: true, user };
}

export async function POST(req: Request) {
    const auth = await requireAdmin(req);
    if (!auth.ok) return NextResponse.json(auth.body, { status: auth.status });

    const body = await req.json();
    const { experience_id, title, content = '', order_index = 0, step_type = 'text', duration_sec = 30 } = body;
    if (!experience_id) return NextResponse.json({ error: 'Missing experience_id' }, { status: 400 });

    const { data, error } = await supabaseAdmin.from('experience_steps').insert([{ experience_id, title, content, order_index, step_type, duration_sec }]).select().maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

export async function PATCH(req: Request) {
    const auth = await requireAdmin(req);
    if (!auth.ok) return NextResponse.json(auth.body, { status: auth.status });

    const body = await req.json();
    const items: { id: string; order_index: number }[] = body.items || [];
    if (!Array.isArray(items)) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

    const updates = items.map(i => ({ id: i.id, order_index: i.order_index, updated_at: new Date().toISOString() }));
    const { error } = await supabaseAdmin.from('experience_steps').upsert(updates, { onConflict: 'id' });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}

export async function PUT(req: Request) {
    const auth = await requireAdmin(req);
    if (!auth.ok) return NextResponse.json(auth.body, { status: auth.status });

    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const body = await req.json();
    const { error } = await supabaseAdmin.from('experience_steps').update({ ...body, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
    const auth = await requireAdmin(req);
    if (!auth.ok) return NextResponse.json(auth.body, { status: auth.status });

    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const { error } = await supabaseAdmin.from('experience_steps').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

async function isAdmin(accessToken?: string) {
    if (!accessToken) return false;
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.auth.getUser(accessToken);
    if (error || !data?.user) return false;
    const user = data.user;

    const { data: profileData, error: pErr } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

    if (pErr || !profileData) return false;
    return profileData.role === 'admin';
}

export async function POST(req: Request) {
    const supabaseAdmin = getSupabaseAdmin();
    const auth = req.headers.get('authorization') || undefined;
    const token = auth?.startsWith('Bearer ') ? auth.split(' ')[1] : auth;
    if (!await isAdmin(token)) return new NextResponse('Forbidden', { status: 403 });

    const body = await req.json();
    const payload = {
        experience_id: body.experience_id,
        title: body.title || 'Új lépés',
        content: body.content || '',
        order_index: typeof body.order_index === 'number' ? body.order_index : 0,
        step_type: body.step_type || 'text',
        duration_sec: typeof body.duration_sec === 'number' ? body.duration_sec : 30
    };

    const { data, error } = await supabaseAdmin.from('experience_steps').insert(payload).select().maybeSingle();
    if (error) return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    return NextResponse.json(data);
}

export async function PUT(req: Request) {
    const supabaseAdmin = getSupabaseAdmin();
    const auth = req.headers.get('authorization') || undefined;
    const token = auth?.startsWith('Bearer ') ? auth.split(' ')[1] : auth;
    if (!await isAdmin(token)) return new NextResponse('Forbidden', { status: 403 });

    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return new NextResponse('Missing id', { status: 400 });
    const body = await req.json();

    const { error } = await supabaseAdmin.from('experience_steps').update({
        title: body.title,
        content: body.content,
        order_index: body.order_index,
        step_type: body.step_type,
        duration_sec: body.duration_sec
    }).eq('id', id);

    if (error) return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    return new NextResponse(null, { status: 204 });
}

export async function DELETE(req: Request) {
    const supabaseAdmin = getSupabaseAdmin();
    const auth = req.headers.get('authorization') || undefined;
    const token = auth?.startsWith('Bearer ') ? auth.split(' ')[1] : auth;
    if (!await isAdmin(token)) return new NextResponse('Forbidden', { status: 403 });

    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return new NextResponse('Missing id', { status: 400 });

    const { error } = await supabaseAdmin.from('experience_steps').delete().eq('id', id);
    if (error) return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    return new NextResponse(null, { status: 204 });
}

export async function PATCH(req: Request) {
    // reorder
    const supabaseAdmin = getSupabaseAdmin();
    const auth = req.headers.get('authorization') || undefined;
    const token = auth?.startsWith('Bearer ') ? auth.split(' ')[1] : auth;
    if (!await isAdmin(token)) return new NextResponse('Forbidden', { status: 403 });

    const body = await req.json();
    const items = body.items || [];

    const { error } = await supabaseAdmin.from('experience_steps').upsert(items, { onConflict: 'id' });
    if (error) return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    return new NextResponse(null, { status: 204 });
}
