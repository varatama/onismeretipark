import { headers } from 'next/headers';
import { getStripe } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import Stripe from 'stripe';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    if (!endpointSecret) {
        return new Response('Webhook secret missing', { status: 500 });
    }

    const body = await req.text();
    const sig = (await headers()).get('stripe-signature');

    let event: Stripe.Event;

    try {
        if (!sig) throw new Error('No signature');
        event = getStripe().webhooks.constructEvent(body, sig, endpointSecret);
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
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    await (getSupabaseAdmin() as any)
                        .from('profiles')
                        .update({
                            plan: 'premium',
                            stripe_customer_id: customerId,
                            stripe_subscription_id: subscriptionId,
                            plan_updated_at: new Date().toISOString()
                        })
                        .eq('id', userId);
                }
                break;
            }

            case 'customer.subscription.deleted': {
                // Subscription cancelled/expired
                // We need to find the user by customer_id
                const customerId = subscription.customer as string;

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await (getSupabaseAdmin() as any)
                    .from('profiles')
                    .update({
                        plan: 'free',
                        plan_updated_at: new Date().toISOString()
                    })
                    .eq('stripe_customer_id', customerId);
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
