import Stripe from 'stripe';

export const STRIPE_ENABLED = Boolean(
    process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PRICE_ID && process.env.NEXT_PUBLIC_SITE_URL
);

let stripeInstance: Stripe | null = null;

export const getStripe = (): Stripe | null => {
    if (!STRIPE_ENABLED) return null;
    if (stripeInstance) return stripeInstance;

    const key = process.env.STRIPE_SECRET_KEY as string;

    stripeInstance = new Stripe(key, {
        typescript: true,
    });

    return stripeInstance;
};
