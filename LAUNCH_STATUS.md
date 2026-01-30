# LAUNCH_STATUS.md - Virtuális Önismereti Park

## Aktuális fázis
Phase 6: UI + Role System + Admin Studio PRO ✅

## Elkészült funkciók
### 1. Determinisztikus DB Bootstrap
- Minden ID UUID, minden query stabil.
- `package.json` scriptek: `db:link`, `db:push`, `db:seed`.

### 2. UI & Design System
- **PageShell**: Desktop-ready (`max-w-md` alap, `max-w-5xl` admin).
- **Guards**: `RequireAuth` és `RequireRole` komponensek védik az oldalakat.
- **Nav**: Bottom nav és headerek konzisztensek.

### 3. Admin Content Studio 2.0
- **Lista**: Szűrés (status, visibility), rendezés (drag & drop logika).
- **Editor**: Metadata, status/visibility dropdownok, veszélyzóna.
- **Steps Editor**: Lépések hozzáadása, törlése, rendezése, típusválasztás.
- **Reorder**: Batch update logika DB oldalon.

### 4. User Profile 2.0
- **ProfileEditor**: Inline név/avatar szerkesztés.
- **OnboardingEditor**: Célok és szintek módosítása.
- **Subscription**: Csomag állapot kijelzés és upgrade CTA.

## Ellenőrző Lista (Verification Checklist)
- [x] `npm run build` sikeres.
- [x] Admin felületen teljes CRUD és Reorder működik.
- [x] User felületen profil szerkesztés működik.
- [x] Nincs 403/406 hiba a konzolban.
- [x] Mobil és Desktop nézet is helyes.

## Mi a következő lépés
- **Tartalom**: Most már tényleg fel lehet tölteni a valódi anyagokat.
- **Live/Chat**: Ezek a funkciók még placeholder státuszban vannak, Phase 7 lehetne a kidolgozásuk.
