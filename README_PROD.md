## Telepítési és Üzemeltetési útmutató (Production)

Ez a dokumentum lépésről-lépésre leírja, hogyan készítsd elő a környezetet, Stripe és Supabase beállításokat, webhookokat és a Vercel deployt.

1) Környezeti változók
- A projekt gyökerében hozz létre titkos környezeti beállításokat (deployment platformon):
  - `NEXT_PUBLIC_SUPABASE_URL` - Supabase projekt URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon kulcs
  - `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role kulcs (NE KERÜLJÖN KÖZVETLENÜL A KLIENSRE)
  - `STRIPE_SECRET_KEY` - Stripe secret key (sk_live_...) (server-only)
  - `NEXT_PUBLIC_STRIPE_PRICE_ID` - Az előfizetési ár (price_...) (public)
  - `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret (whsec_...)
  - `NEXT_PUBLIC_SITE_URL` - Your public site URL; the app computes all redirect URLs from this value
  - `ADMIN_BOOTSTRAP_EMAIL` - Az első admin e-mail címe
  - (opcionális) `NEXT_PUBLIC_ADMIN_BOOTSTRAP_EMAIL` - ha a debug UI-n meg szeretnéd jeleníteni a bootstrap gombot

2) Supabase
- Futtasd a migrációkat (`supabase` CLI vagy psql) – a `supabase/migrations` mappában van az `audit_logs` létrehozása.
- Állíts be RLS szabályokat úgy, hogy a `profiles` tábla szerkesztését csak a szerver oldali service role tegye lehetővé, míg a felhasználói saját sorát a front-end kezelheti.

3) Stripe
- Hozz létre egy `Price` objektumot subscription típusban, és állítsd be `STRIPE_PRICE_ID`-ként.
- Webhook: Add meg a `STRIPE_WEBHOOK_SECRET` értéket az alkalmazásodban és állítsd be a következő URL-t a Stripe Dashboardban:
  - `https://<your-domain>/api/stripe/webhook`

4) Deploy (Vercel / Netlify / egyéb)
- Adj meg minden fenti környezeti változót a szolgáltatás felületén.
- Add meg a `SUPABASE_SERVICE_ROLE_KEY` csak a szerver environmentben.
- Telepítsd, és a GitHub Actions CI lefut minden push/PR-n a `main` ágra.

5) Első admin beállítása (biztonságos)
- Állítsd be `ADMIN_BOOTSTRAP_EMAIL` értékét az első admin e-mail címére.
- Jelentkezz be azzal az e-mail címmel, majd a Debug oldalon nyomd meg az "Admin mód aktiválása" gombot (vagy hívd meg a `POST /api/admin/bootstrap-first-admin` endpointot a bejelentkezett felhasználó access_tokenjével).

6) Ellenőrzés
- Indíts egy próba checkout-ot az `/elofizetes` oldalon.
- Stripe webhook feldolgozza a `checkout.session.completed` eseményt és beállítja a `profiles.plan = 'premium'` értéket.
- Az audit események a `public.audit_logs` táblában lesznek megtalálhatók.
