/* eslint-disable @typescript-eslint/no-explicit-any */
import { headers } from 'next/headers';
import { getStripe, STRIPE_ENABLED } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { logAudit } from '@/lib/audit';
import Stripe from 'stripe';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    if (!STRIPE_ENABLED) {
        return new Response(JSON.stringify({ disabled: true }), {
            status: 200,
            headers: { 'content-type': 'application/json' }
        });
    }

    if (!endpointSecret) {
        return new Response('Webhook secret missing', { status: 500 });
    }

    const body = await req.text();
    const sig = (await headers()).get('stripe-signature');

    let event: Stripe.Event;

    try {
        if (!sig) throw new Error('No signature');
        const stripe = getStripe();
        if (!stripe) throw new Error('Stripe not configured');
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`Webhook Error: ${msg}`);
        return new Response(`Webhook Error: ${msg}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;
    const subscription = event.data.object as Stripe.Subscription;

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                // User paid
                const userId = session.client_reference_id;
                const customerId = session.customer as string;
                const subscriptionId = session.subscription as string;

                if (userId) {
                    const supabaseAdmin = getSupabaseAdmin();
                    const clientAny = supabaseAdmin as any;
                    await clientAny
                        .from('profiles')
                        .update({
                            plan: 'premium',
                            stripe_customer_id: customerId,
                            stripe_subscription_id: subscriptionId,
                            plan_updated_at: new Date().toISOString()
                        } as any)
                        .eq('id', userId);

                    await logAudit('checkout_success', { subscriptionId }, userId);
                }
                break;
            }

            case 'customer.subscription.deleted': {
                // Subscription cancelled/expired
                // We need to find the user by customer_id
                const customerId = subscription.customer as string;
                const supabaseAdmin = getSupabaseAdmin();
                const clientAny = supabaseAdmin as any;

                await clientAny
                    .from('profiles')
                    .update({
                        plan: 'free',
                        plan_updated_at: new Date().toISOString()
                    } as any)
                    .eq('stripe_customer_id', customerId);
                await logAudit('subscription_deleted', { customerId });
                break;
            }

            // Handle other states like payment_failed if needed
        }
    } catch (error) {
        console.error('Webhook handler failed:', error);
        return new Response('Handler failed', { status: 500 });
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
}
