import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

async function isAdmin(accessToken?: string) {
    if (!accessToken) return false;
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.auth.getUser(accessToken);
    if (error || !data?.user) return false;
    const user = data.user;

    const profileRes = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

    if (profileRes.error || !profileRes.data) return false;
    return (profileRes.data as any).role === 'admin';
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

    const { data, error } = await supabaseAdmin.from('experiences').insert([payload] as any).select().maybeSingle();
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

    const { error } = await (supabaseAdmin.from('experiences') as any).update({
        title: body.title,
        description: body.description,
        status: body.status,
        visibility: body.visibility,
        difficulty: body.difficulty,
        duration_min: Number(body.duration_min),
        cover_emoji: body.cover_emoji
    }).eq('id', id);

    if (error) return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    return new NextResponse(null, { status: 204 });
}

export async function PATCH(req: Request) {
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

export async function DELETE(req: Request) {
    const supabaseAdmin = getSupabaseAdmin();
    const auth = req.headers.get('authorization') || undefined;
    const token = auth?.startsWith('Bearer ') ? auth.split(' ')[1] : auth;
    if (!await isAdmin(token)) return new NextResponse('Forbidden', { status: 403 });

    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return new NextResponse('Missing id', { status: 400 });

    const { error } = await supabaseAdmin.from('experiences').delete().eq('id', id);
    if (error) return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    return new NextResponse(null, { status: 204 });
}
