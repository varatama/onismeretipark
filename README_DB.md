# Database Setup - Virtuális Önismereti Park

Ez a projekt determinisztikus, egy-parancsos adatbázis bootstrap rendszert használ.

## Telepítés új gépen / új Supabase projekthez

1. **Összekötés**:
   ```bash
   npm run db:link
   ```
   *(Kérni fogja a Project ID-t és a Database Password-öt)*

2. **Adatbázis sémák és jogosultságok feltolása**:
   ```bash
   npm run db:push
   ```
   *Ez törli a korábbi (apphoz tartozó) táblákat és újrahúzza a teljes Phase 5 sémát.*

3. **Demó adatok (Experiences + Steps) betöltése**:
   ```bash
   npm run db:seed
   ```
   *Feltölti a 3 alapértelmezett élményt fixed UUID-kkal.*

## Backfill és első admin bootstrap (Phase 6 determinisztikus admin)

Az alábbi migration biztosítja, hogy minden meglévő `auth.users` rekordhoz legyen `public.profiles` és `public.onboarding` sor. Emellett egy biztonságos, idempotens SQL függvényt ad hozzá: `public.bootstrap_first_admin(p_email text)` amely az első admin felhasználót emeli adminná a megadott email alapján, de csak akkor, ha jelenleg még nincs admin.

1) Futtasd a migration-t (ha még nem futott):

```bash
npm run db:push
```

2) Ellenőrizd az auth user-t és profilját (példa `varaljatamas@gmail.com` esetén):

```sql
SELECT id,email FROM auth.users WHERE email ILIKE 'varaljatamas@gmail.com';
-- ha az id-t látod, ellenőrizd a profil-t:
SELECT id, email, role, created_at FROM public.profiles WHERE id = 'a13f7f86-9b1e-4861-af81-d2798881c6d7';
```

3) Bootstrap első admin (futtasd csak akkor, ha valóban nincs admin):

```sql
SELECT public.bootstrap_first_admin('varaljatamas@gmail.com');
```

4) Ellenőrzés:

```sql
SELECT id,email,role FROM public.profiles WHERE email ILIKE 'varaljatamas@gmail.com';
```

Ha az `auth.users` lekérdezés nem ad vissza sorokat, akkor elképzelhető, hogy rossz Supabase projektet nézel (pl. production vs local). Ellenőrizd a Supabase Project ref-ét és a Dashboard jobb felső sarkában a kiválasztott projektet.

További hibaüzenetek és diagnosztika:

- Ha `INSERT` vagy `UPSERT` `profiles`-ra FK hibát ad (profiles.id references auth.users(id)), akkor hiányzik a `auth.users` rekord — hozd létre a felhasználót a Supabase Dashboardon (Auth → Users → Create user), vagy használd a Admin REST API-t service role kulccsal.


## Frontend Automatikus Szinkronizáció
Az alkalmazás automatikusan kezeli a hiányzó profilokat. Ha egy felhasználó először lép be (pl. Google OAuth), de a `public.profiles` vagy `public.onboarding` táblában még nincs sora, a `getOrSyncProfile` helper automatikusan létrehozza azt az első betöltéskor.

## Mi változott?
- Minden ID UUID típusú.
- `order_index` alapján történik a rendezés a Parkban.
- RLS policy-k védik a felhasználói adatokat.
- Statikus seed fájl az azonnali tesztelhetőségért.
