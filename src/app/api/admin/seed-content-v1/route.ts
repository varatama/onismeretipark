/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import type { Database } from '@/lib/database.types';

async function isAdmin(accessToken?: string) {
    if (!accessToken) return false;
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.auth.getUser(accessToken);
    if (error || !data?.user) return false;
    const user = data.user;
    const profileRes = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (profileRes.error || !profileRes.data) return false;
    return (profileRes.data as Database['public']['Tables']['profiles']['Row']).role === 'admin';
}

export async function POST(req: Request) {
    const auth = req.headers.get('authorization') || undefined;
    const token = auth?.startsWith('Bearer ') ? auth.split(' ')[1] : auth;
    if (!await isAdmin(token)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Seed data - for idempotency we upsert using fixed IDs matching the SQL seed file.
    const experiences = [
        {
            id: '11111111-0000-4000-8000-000000000001',
            title: 'Nyugi 5p',
            description: 'Gyors stresszoldás és megérkezés a jelenbe.',
            status: 'published',
            visibility: 'public',
            difficulty: 'easy',
            duration_min: 5,
            cover_emoji: '☕',
        },
        {
            id: '11111111-0000-4000-8000-000000000002',
            title: 'Fókusz 8p',
            description: 'Szellemi frissesség és koncentráció javítása.',
            status: 'published',
            visibility: 'premium',
            difficulty: 'medium',
            duration_min: 8,
            cover_emoji: '🎯',
        },
        {
            id: '11111111-0000-4000-8000-000000000003',
            title: 'Esti levezetés 10p',
            description: 'A nap lezárása és felkészülés a pihentető alvásra.',
            status: 'published',
            visibility: 'premium',
            difficulty: 'easy',
            duration_min: 10,
            cover_emoji: '🌙',
        },
    ];

    const steps = [
        // Exp 1: Nyugi 5p (id: ...001)
        { id: '21111111-0000-4000-8001-000000000001', experience_id: '11111111-0000-4000-8000-000000000001', order_index: 10, title: 'Megérkezés', content: 'Helyezkedj el kényelmesen. Hunyd le a szemed, ha jól esik.', step_type: 'text', duration_sec: 30 },
        { id: '21111111-0000-4000-8001-000000000002', experience_id: '11111111-0000-4000-8000-000000000001', order_index: 20, title: 'Mély légzés', content: 'Lélegezz mélyeket. Orron be, szájon ki.', step_type: 'breath', duration_sec: 60 },
        { id: '21111111-0000-4000-8001-000000000003', experience_id: '11111111-0000-4000-8000-000000000001', order_index: 30, title: 'Testszkennelés', content: 'Hol érzel feszültséget? Picit mozgasd át a vállaidat.', step_type: 'audio', duration_sec: 60 },
        { id: '21111111-0000-4000-8001-000000000004', experience_id: '11111111-0000-4000-8000-000000000001', order_index: 40, title: 'Jelenlét', content: 'Mi az az 1 dolog, ami most jó érzéssel tölt el?', step_type: 'prompt', duration_sec: 45 },
        { id: '21111111-0000-4000-8001-000000000005', experience_id: '11111111-0000-4000-8000-000000000001', order_index: 50, title: 'Elengedés', content: 'Képzeld el, hogy kilégzéssel kifújod a gondokat.', step_type: 'text', duration_sec: 45 },
        { id: '21111111-0000-4000-8001-000000000006', experience_id: '11111111-0000-4000-8000-000000000001', order_index: 60, title: 'Zárás', content: 'Nyújtozz egy nagyot, és térj vissza a napodhoz.', step_type: 'text', duration_sec: 30 },

        // Exp 2: Fókusz 8p (id: ...002)
        { id: '21111111-0000-4000-8002-000000000001', experience_id: '11111111-0000-4000-8000-000000000002', order_index: 10, title: 'Célkitűzés', content: 'Mi a legfontosabb feladatod a következő órában?', step_type: 'prompt', duration_sec: 60 },
        { id: '21111111-0000-4000-8002-000000000002', experience_id: '11111111-0000-4000-8000-000000000002', order_index: 20, title: 'Box légzés', content: '4 mp be, 4 mp bent tart, 4 mp ki, 4 mp szünet.', step_type: 'breath', duration_sec: 120 },
        { id: '21111111-0000-4000-8002-000000000003', experience_id: '11111111-0000-4000-8000-000000000002', order_index: 30, title: 'Zavaró tényezők', content: 'Mik azok a dolgok, amik kizökkenthetnek? (pl. telefon, zaj)', step_type: 'text', duration_sec: 60 },
        { id: '21111111-0000-4000-8002-000000000004', experience_id: '11111111-0000-4000-8000-000000000002', order_index: 40, title: 'Stratégia', content: 'Hogyan fogsz védekezni ellenük? (A) Némítás (B) Fülhallgató (C) Elvonulás', step_type: 'choice', duration_sec: null },
        { id: '21111111-0000-4000-8002-000000000005', experience_id: '11111111-0000-4000-8000-000000000002', order_index: 50, title: 'Vizualizáció', content: 'Lásd magad előtt, ahogy sikeresen végzed a feladatot.', step_type: 'audio', duration_sec: 90 },
        { id: '21111111-0000-4000-8002-000000000006', experience_id: '11111111-0000-4000-8000-000000000002', order_index: 60, title: 'Motiváció', content: 'Miért fontos ez neked most?', step_type: 'prompt', duration_sec: 60 },
        { id: '21111111-0000-4000-8002-000000000007', experience_id: '11111111-0000-4000-8000-000000000002', order_index: 70, title: 'Indulás', content: 'Készen állsz. 3, 2, 1... Vágj bele!', step_type: 'text', duration_sec: 30 },

        // Exp 3: Esti levezetés 10p (id: ...003)
        { id: '21111111-0000-4000-8003-000000000001', experience_id: '11111111-0000-4000-8000-000000000003', order_index: 10, title: 'Napzárás', content: 'Hagyd hátra a nap eseményeit. Ez az idő most a pihenésé.', step_type: 'text', duration_sec: 60 },
        { id: '21111111-0000-4000-8003-000000000002', experience_id: '11111111-0000-4000-8000-000000000003', order_index: 20, title: 'Hála', content: 'Sorolj fel 3 dolgot, amiért hálás vagy ma.', step_type: 'prompt', duration_sec: 90 },
        { id: '21111111-0000-4000-8003-000000000003', experience_id: '11111111-0000-4000-8000-000000000003', order_index: 30, title: 'Lassú légzés', content: 'Lélegezz nagyon lassan. Belégzés 4, kilégzés 8 másodperc.', step_type: 'breath', duration_sec: 120 },
        { id: '21111111-0000-4000-8003-000000000004', experience_id: '11111111-0000-4000-8000-000000000003', order_index: 40, title: 'Feszültségoldás', content: 'Feszítsd meg, majd ernyeszd el az izmaidat lábfejtől felfelé.', step_type: 'audio', duration_sec: 120 },
        { id: '21111111-0000-4000-8003-000000000005', experience_id: '11111111-0000-4000-8000-000000000003', order_index: 50, title: 'Gondolatok', content: 'Ha jön egy gondolat, képzeld el, hogy felhőként elúszik.', step_type: 'text', duration_sec: 60 },
        { id: '21111111-0000-4000-8003-000000000006', experience_id: '11111111-0000-4000-8000-000000000003', order_index: 60, title: 'Holnapi terv', content: 'Egyetlen szóban: mi a holnapi szándékod?', step_type: 'prompt', duration_sec: 60 },
        { id: '21111111-0000-4000-8003-000000000007', experience_id: '11111111-0000-4000-8000-000000000003', order_index: 70, title: 'Elcsendesedés', content: 'Élvezd a csendet és a nyugalmat.', step_type: 'choice', duration_sec: null },
        { id: '21111111-0000-4000-8003-000000000008', experience_id: '11111111-0000-4000-8000-000000000003', order_index: 80, title: 'Jó éjszakát', content: 'Készen állsz az alvásra. Jó pihenést.', step_type: 'text', duration_sec: 30 },
    ];

    const supabaseAdmin = getSupabaseAdmin();
    const clientAny = supabaseAdmin as any;

    // Upsert experiences
    const { error: expErr } = await clientAny.from('experiences').upsert(experiences as any, { onConflict: 'id' });
    if (expErr) return NextResponse.json({ error: expErr.message }, { status: 500 });

    // Upsert steps
    const { error: stepsErr } = await clientAny.from('experience_steps').upsert(steps as any, { onConflict: 'id' });
    if (stepsErr) return NextResponse.json({ error: stepsErr.message }, { status: 500 });

    return NextResponse.json({ ok: true });
}
