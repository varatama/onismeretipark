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

    // Verify user via Supabase (service-role) using the bearer token
    const { data: userData, error: userErr } = await getSupabaseAdmin().auth.getUser(token);
    if (userErr || !userData?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = userData.user;

    const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;
    const site = process.env.NEXT_PUBLIC_SITE_URL || '';
    const successUrl = `${site}/profil`;
    const cancelUrl = `${site}/elofizetes`;

    if (!priceId) return NextResponse.json({ error: 'NEXT_PUBLIC_STRIPE_PRICE_ID not configured' }, { status: 500 });

    const stripe = getStripe();
    if (!stripe) return NextResponse.json({ error: 'Stripe not configured', disabled: true }, { status: 503 });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: user.id,
      customer_email: user.email ?? undefined,
      success_url: successUrl,
      cancel_url: cancelUrl
    });

    // Audit: checkout started
    await logAudit('checkout_started', { priceId }, user.id);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
