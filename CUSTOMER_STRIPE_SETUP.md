Customer Stripe setup

This document describes the minimal Stripe configuration and environment variables required to enable Stripe Checkout and Billing Portal for production.

Required environment variables (server):
- STRIPE_SECRET_KEY: Your Stripe Secret Key (starts with `sk_`). Keep this server-only.
- STRIPE_WEBHOOK_SECRET: The signing secret for webhook verification (from the Stripe Dashboard > Webhooks).

Required environment variables (public):
- NEXT_PUBLIC_STRIPE_PRICE_ID: The Price ID for your subscription (starts with `price_`).
- NEXT_PUBLIC_SITE_URL: Your public site URL (e.g. `https://app.example.com`).

Redirect URLs (computed):
- The application computes redirect URLs deterministically from `NEXT_PUBLIC_SITE_URL`:
  - success: `${NEXT_PUBLIC_SITE_URL}/profil`
  - cancel: `${NEXT_PUBLIC_SITE_URL}/elofizetes`
  - billing portal return: `${NEXT_PUBLIC_SITE_URL}/profil`
Note: The legacy envs `STRIPE_SUCCESS_URL`, `STRIPE_CANCEL_URL`, and `STRIPE_PORTAL_RETURN_URL` are ignored by the app and should not be used.

Webhook endpoint:
- Endpoint URL: `${NEXT_PUBLIC_SITE_URL}/api/stripe/webhook`
- Events to subscribe (recommended):
  - `checkout.session.completed`
  - `customer.subscription.deleted`
  - (optional) `invoice.payment_failed`

Getting keys from the Stripe Dashboard:
1. Log in to Stripe Dashboard.
2. Developers > API keys: copy the Secret Key (`sk_...`) into `STRIPE_SECRET_KEY`.
3. Products > Prices: create a recurring Price and copy its `price_...` ID into `NEXT_PUBLIC_STRIPE_PRICE_ID`.
4. Developers > Webhooks: Add an endpoint with the URL above and subscribe to the events listed. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

Testing locally:
- For local dev without Stripe, the app supports Stripe-optional mode. If `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PRICE_ID` are not set, Stripe routes will return disabled responses and the `/elofizetes` UI will show a message that Stripe is not configured.
- If you want to run end-to-end tests locally, use `stripe listen` (Stripe CLI) to forward webhook events and set `STRIPE_WEBHOOK_SECRET` to the value provided by the CLI.

Go-live checklist:
- Confirm `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PRICE_ID` are set in production environment.
- Set `NEXT_PUBLIC_SITE_URL` to the production domain.
- Add the webhook endpoint in Stripe and set `STRIPE_WEBHOOK_SECRET` in production.
- Test a full checkout with a test card (`4242 4242 4242 4242`) in Stripe test mode, verify webhook handling updates user profiles.
- Ensure service-role keys are never exposed to the browser or committed to the repo.

Security notes:
- Never include `STRIPE_SECRET_KEY` in client-side code or public repo. Use server-only environment variables.
- The app will treat missing Stripe config as "disabled" and avoid initializing the SDK or exposing errors.
