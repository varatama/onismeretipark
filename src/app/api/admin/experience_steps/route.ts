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

type StepUpdate = Partial<{
    title: string;
    content: string;
    order_index: number;
    step_type: 'text' | 'prompt' | 'choice' | 'breath' | 'audio';
    duration_sec: number;
}>;

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

    const { data, error } = await supabaseAdmin.from('experience_steps').insert([payload] as any).select().maybeSingle();
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

    const payload: StepUpdate = {
        title: body.title,
        content: body.content,
        order_index: Number(body.order_index),
        step_type: body.step_type,
        duration_sec: Number(body.duration_sec),
    };

    const { error } = await (supabaseAdmin.from('experience_steps') as any)
        .update(payload as any)
        .eq('id', id);

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

    const { error } = await (supabaseAdmin.from('experience_steps') as any).delete().eq('id', id);
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

    const { error } = await (supabaseAdmin.from('experience_steps') as any).upsert(items, { onConflict: 'id' });
    if (error) return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    return new NextResponse(null, { status: 204 });
}
