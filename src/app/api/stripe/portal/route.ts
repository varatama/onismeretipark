/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { getStripe, STRIPE_ENABLED } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    if (!STRIPE_ENABLED) return NextResponse.json({ disabled: true }, { status: 503 });
    const auth = req.headers.get('authorization') || '';
    const token = auth.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: userData, error: userErr } = await getSupabaseAdmin().auth.getUser(token);
    if (userErr || !userData?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = userData.user;

    const { data: profile, error: profileErr } = await getSupabaseAdmin()
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .maybeSingle();

    if (profileErr) return NextResponse.json({ error: 'Profile lookup failed' }, { status: 500 });
    const customerId = (profile as any)?.stripe_customer_id;
    if (!customerId) return NextResponse.json({ error: 'No Stripe customer found' }, { status: 400 });

    const site = process.env.NEXT_PUBLIC_SITE_URL || '';
    const returnUrl = `${site}/profil`;
    const stripe = getStripe();
    if (!stripe) return NextResponse.json({ error: 'Stripe not configured', disabled: true }, { status: 503 });

    const session = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: returnUrl });

    await logAudit('portal_opened', { }, user.id);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Portal error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
