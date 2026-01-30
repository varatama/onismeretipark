import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export const getStripe = () => {
    if (stripeInstance) return stripeInstance;

    const key = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';

    stripeInstance = new Stripe(key, {
        apiVersion: '2026-01-28.clover' as any,
        typescript: true,
    });

    return stripeInstance;
};
