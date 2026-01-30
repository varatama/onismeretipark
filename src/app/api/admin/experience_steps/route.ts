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

type StepUpdate = Database['public']['Tables']['experience_steps']['Update'];
type StepInsert = Database['public']['Tables']['experience_steps']['Insert'];

export async function POST(req: Request) {
    const supabaseAdmin = getSupabaseAdmin();
    const auth = req.headers.get('authorization') || undefined;
    const token = auth?.startsWith('Bearer ') ? auth.split(' ')[1] : auth;
    if (!await isAdmin(token)) return new NextResponse('Forbidden', { status: 403 });

    const body = await req.json();
    const payload: StepInsert = {
        experience_id: String(body.experience_id),
        title: body.title ?? 'Új lépés',
        content: body.content ?? '',
        order_index: typeof body.order_index === 'number' ? body.order_index : Number(body.order_index) || 0,
        step_type: (['text','prompt','choice','breath','audio'] as const).includes(body.step_type) ? body.step_type : 'text',
        duration_sec: typeof body.duration_sec === 'number' ? body.duration_sec : Number(body.duration_sec) || 30,
    };

    const { data, error } = await (supabaseAdmin.from('experience_steps') as any).insert([payload] as Database['public']['Tables']['experience_steps']['Insert'][]).select().maybeSingle();
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

    const patch: StepUpdate = {
        title: body.title ?? undefined,
        content: body.content ?? undefined,
        order_index: typeof body.order_index === 'number' ? body.order_index : (Number(body.order_index) || undefined),
        step_type: (['text','prompt','choice','breath','audio'] as const).includes(body.step_type) ? body.step_type : undefined,
        duration_sec: typeof body.duration_sec === 'number' ? body.duration_sec : (Number(body.duration_sec) || undefined),
    };

    const { error } = await supabaseAdmin.from('experience_steps').update(patch).eq('id', id);

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
    const itemsRaw = body.items || [];
    const items = (itemsRaw as any[]).map(it => ({
        id: String(it.id),
        order_index: typeof it.order_index === 'number' ? it.order_index : Number(it.order_index) || 0,
    })) as Database['public']['Tables']['experience_steps']['Insert'][];

    const { error } = await supabaseAdmin.from('experience_steps').upsert(items, { onConflict: 'id' });
    if (error) return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    return new NextResponse(null, { status: 204 });
}
