import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import type { Database } from '@/lib/database.types';

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
    return (profileRes.data as Database['public']['Tables']['profiles']['Row']).role === 'admin';
}

export async function POST(req: Request) {
    const supabaseAdmin = getSupabaseAdmin();
    const body = await req.json();
    const auth = req.headers.get('authorization') || undefined;
    const token = auth?.startsWith('Bearer ') ? auth.split(' ')[1] : auth;

    if (!await isAdmin(token)) return new NextResponse('Forbidden', { status: 403 });

    type ExpInsert = Database['public']['Tables']['experiences']['Insert'];
    const payload: ExpInsert = {
        title: body.title ?? 'Új Élmény',
        description: body.description ?? '',
        status: body.status ?? 'draft',
        visibility: body.visibility ?? 'hidden',
        difficulty: body.difficulty ?? 'medium',
        duration_min: typeof body.duration_min === 'number' ? body.duration_min : Number(body.duration_min) || 10,
        cover_emoji: body.cover_emoji ?? null,
    };

    const { data, error } = await supabaseAdmin.from('experiences').insert([payload]).select().maybeSingle();
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

    type ExpUpdate = Database['public']['Tables']['experiences']['Update'];
    const patch: ExpUpdate = {
        title: body.title ?? undefined,
        description: body.description ?? undefined,
        status: body.status ?? undefined,
        visibility: body.visibility ?? undefined,
        difficulty: body.difficulty ?? undefined,
        duration_min: typeof body.duration_min === 'number' ? body.duration_min : (Number(body.duration_min) || undefined),
        cover_emoji: body.cover_emoji ?? undefined,
    };

    const { error } = await supabaseAdmin.from('experiences').update(patch).eq('id', id);

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

    const itemsArr = (items as any[]).map(it => ({
        id: it.id,
        title: it.title,
        description: it.description,
        status: it.status,
        visibility: it.visibility,
        difficulty: it.difficulty,
        duration_min: typeof it.duration_min === 'number' ? it.duration_min : Number(it.duration_min) || null,
        cover_emoji: it.cover_emoji ?? null,
    })) as Database['public']['Tables']['experiences']['Insert'][];

    const { error } = await supabaseAdmin.from('experiences').upsert(itemsArr, { onConflict: 'id' });
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
