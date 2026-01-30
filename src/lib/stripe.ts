import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export const getStripe = () => {
    if (stripeInstance) return stripeInstance;

    const key = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';

    stripeInstance = new Stripe(key, {
        typescript: true,
    });

    return stripeInstance;
};
