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
    // create new experience
    const auth = await requireAdmin(req);
    if (!auth.ok) return NextResponse.json(auth.body, { status: auth.status });

    const body = await req.json();
    const { title, description, status = 'draft', visibility = 'hidden', difficulty = 'medium', duration_min = 10, order_index } = body;

    // compute order_index if not provided
    let idx = order_index;
    if (typeof idx !== 'number') {
        const { data } = await supabaseAdmin.from('experiences').select('order_index').order('order_index', { ascending: false }).limit(1);
        idx = (data && data[0] && typeof data[0].order_index === 'number') ? data[0].order_index + 1 : 0;
    }

    const { data, error } = await supabaseAdmin.from('experiences').insert([{ title, description, status, visibility, difficulty, duration_min, order_index: idx }]).select().maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

export async function PATCH(req: Request) {
    // reorder experiences
    const auth = await requireAdmin(req);
    if (!auth.ok) return NextResponse.json(auth.body, { status: auth.status });

    const body = await req.json();
    const items: { id: string; order_index: number }[] = body.items || [];
    if (!Array.isArray(items)) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

    // upsert updates by id
    const updates = items.map(i => ({ id: i.id, order_index: i.order_index, updated_at: new Date().toISOString() }));
    const { error } = await supabaseAdmin.from('experiences').upsert(updates, { onConflict: 'id' });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}

export async function PUT(req: Request) {
    // update experience by id query param
    const auth = await requireAdmin(req);
    if (!auth.ok) return NextResponse.json(auth.body, { status: auth.status });

    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const body = await req.json();
    const { error } = await supabaseAdmin.from('experiences').update({ ...body, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
    const auth = await requireAdmin(req);
    if (!auth.ok) return NextResponse.json(auth.body, { status: auth.status });

    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const { error } = await supabaseAdmin.from('experiences').delete().eq('id', id);
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
    const body = await req.json();
    const auth = req.headers.get('authorization') || undefined;
    const token = auth?.startsWith('Bearer ') ? auth.split(' ')[1] : auth;

    if (!await isAdmin(token)) return new NextResponse('Forbidden', { status: 403 });

    const payload = {
        title: body.title || 'Új Élmény',
        description: body.description || '',
        status: body.status || 'draft',
        visibility: body.visibility || 'hidden',
        order_index: typeof body.order_index === 'number' ? body.order_index : 0,
        difficulty: body.difficulty || 'medium',
        duration_min: typeof body.duration_min === 'number' ? body.duration_min : 10,
        cover_emoji: body.cover_emoji || null
    };

    const { data, error } = await supabaseAdmin.from('experiences').insert(payload).select().maybeSingle();
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

    const { error } = await supabaseAdmin.from('experiences').update({
        title: body.title,
        description: body.description,
        status: body.status,
        visibility: body.visibility,
        difficulty: body.difficulty,
        duration_min: body.duration_min,
        cover_emoji: body.cover_emoji
    }).eq('id', id);

    if (error) return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    return new NextResponse(null, { status: 204 });
}

export async function POST_REORDER(req: Request) {
    const supabaseAdmin = getSupabaseAdmin();
    const auth = req.headers.get('authorization') || undefined;
    const token = auth?.startsWith('Bearer ') ? auth.split(' ')[1] : auth;
    if (!await isAdmin(token)) return new NextResponse('Forbidden', { status: 403 });

    const body = await req.json();
    const items = body.items || [];

    const { error } = await supabaseAdmin.from('experiences').upsert(items, { onConflict: 'id' });
    if (error) return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    return new NextResponse(null, { status: 204 });
}

// Next.js route handlers export named methods; provide a convenience route for reorder
export async function PATCH(req: Request) {
    // Use PATCH for reorder operations
    return POST_REORDER(req);
}
