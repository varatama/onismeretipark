-- Content Pack v1
-- Idempotent seed: uses ON CONFLICT (id) DO UPDATE

-- 20 experiences with deterministic UUIDs
BEGIN;

-- Experiences
INSERT INTO public.experiences (id, title, description, status, visibility, difficulty, duration_min, cover_emoji, created_at)
VALUES
  ('11111111-0000-4000-8000-000000000001','Önismeret: Kezdetek','Rövid bevezető az önreflexió gyakorlatsorba','published','public','easy',10,'🧭',NOW()),
  ('11111111-0000-4000-8000-000000000002','Stresszkezelés: Légzés','Egyszerű gyakorlatok a stressz csökkentésére légzéssel','published','public','easy',8,'🌬️',NOW()),
  ('11111111-0000-4000-8000-000000000003','Magabiztosság növelése','Gyakorlatok a belső magabiztosság erősítésére','published','public','medium',12,'💪',NOW()),
  ('11111111-0000-4000-8000-000000000004','Kapcsolatok: Empátia','Beszélgetési és hallgatási gyakorlatok az empátia fejlesztésére','published','public','medium',15,'🤝',NOW()),
  ('11111111-0000-4000-8000-000000000005','Önelfogadás: Tükörmunka','Rövid feladatok az önelfogadás gyakorlásához','published','public','easy',10,'🪞',NOW()),
  ('11111111-0000-4000-8000-000000000006','Stressz: Napközbeni felfrissülés','Gyors gyakorlatok a nap közbeni stresszoldáshoz','published','public','easy',7,'⚡',NOW()),
  ('11111111-0000-4000-8000-000000000007','Magabiztosság: Testtartás','Testbeszéd és állás gyakorlatok','published','public','medium',10,'🧍',NOW()),
  ('11111111-0000-4000-8000-000000000008','Kapcsolatok: Konfliktuskezelés','Lépések a konstruktív konfliktuskezeléshez','published','public','hard',20,'⚖️',NOW()),
  ('11111111-0000-4000-8000-000000000009','Önreflexió: Naplógyakorlat','Vezetett kérdések naplóíráshoz','published','public','easy',12,'📓',NOW()),
  ('11111111-0000-4000-8000-00000000000a','Stressz: Alvás előtti megnyugvás','Lazító gyakorlatok az esti rutinhoz','published','public','easy',9,'🌙',NOW()),
  ('11111111-0000-4000-8000-00000000000b','Magabiztosság: Pozitív belső beszéd','Gondolatok átalakítása önmegerősítésre','published','public','medium',11,'🗣️',NOW()),
  ('11111111-0000-4000-8000-00000000000c','Kapcsolatok: Határok','Hogyan kommunikáljunk egészséges határokat','published','public','medium',14,'🛑',NOW()),
  ('11111111-0000-4000-8000-00000000000d','Önismeret: Értékek feltárása','Gyakorlatok az értékrend felismerésére','published','public','easy',13,'🏷️',NOW()),
  ('11111111-0000-4000-8000-00000000000e','Stressz: Rövid relaxáció','5 perces relaxációs folyamat','published','public','easy',6,'🧘',NOW()),
  ('11111111-0000-4000-8000-00000000000f','Magabiztosság: Bevezető szereplés','Kis lépések a nyilvános szerepléshez','published','public','medium',16,'🎤',NOW()),
  ('11111111-0000-4000-8000-000000000010','Kapcsolatok: Köszönő gyakorlat','Hálagyakorlat a kapcsolatok ápolásához','published','public','easy',8,'🙏',NOW()),
  ('11111111-0000-4000-8000-000000000011','Önelfogadás: Hibák kezelése','Hogyan viszonyuljunk a hibákhoz építő módon','published','public','medium',12,'🔁',NOW()),
  ('11111111-0000-4000-8000-000000000012','Stressz: Vizualizáció','Vezetett képzelet a megnyugváshoz','published','public','medium',10,'🎯',NOW()),
  ('11111111-0000-4000-8000-000000000013','Kapcsolatok: Mély beszélgetés','Kérdések és gyakorlatok a mélyebb kapcsolódáshoz','published','public','hard',18,'💬',NOW()),
  ('11111111-0000-4000-8000-000000000014','Önismeret: Hosszabb összegzés','Összefoglaló gyakorlat az eddigiekhez','published','public','medium',20,'🧩',NOW())
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  visibility = EXCLUDED.visibility,
  difficulty = EXCLUDED.difficulty,
  duration_min = EXCLUDED.duration_min,
  cover_emoji = EXCLUDED.cover_emoji,
  created_at = COALESCE(experiences.created_at, EXCLUDED.created_at);

-- Experience steps (representative subset, idempotent)
INSERT INTO public.experience_steps (id, experience_id, order_index, title, content, step_type, duration_sec, created_at)
VALUES
  -- Exp 1
  ('21111111-0000-4000-8000-000000000001','11111111-0000-4000-8000-000000000001',10,'Üdvözlő gondolat','Köszöntünk az önismereti gyakorlatsorban. Figyelj a testedre és lélegezz nyugodtan.','text',30,NOW()),
  ('21111111-0000-4000-8000-000000000002','11111111-0000-4000-8000-000000000001',20,'Éberség játék','Mi az, amit ma leginkább észrevettél magadon? Írd le röviden.','prompt',45,NOW()),
  ('21111111-0000-4000-8000-000000000003','11111111-0000-4000-8000-000000000001',30,'Választás: fókusz','Mire szeretnél ma energiát fordítani? (A) Munka (B) Kapcsolatok (C) Pihenés','choice',NULL,NOW()),
  ('21111111-0000-4000-8000-000000000004','11111111-0000-4000-8000-000000000001',40,'Rövid légzés','Figyeld a légzésedet: 4 másodperc be, 6 másodperc ki, ismételd 5-ször.','breath',60,NOW()),
  ('21111111-0000-4000-8000-000000000005','11111111-0000-4000-8000-000000000001',50,'Záró kérdés','Mit viszel magaddal ebből a gyakorlatsorból?','prompt',60,NOW()),

  -- Exp 2
  ('21111111-0000-4000-8000-000000000006','11111111-0000-4000-8000-000000000002',10,'Bevezető légzés','Ülve vagy állva: lassú belégzés 4 másodpercig, kilégzés 6 másodpercig, 6 ismétlés.','breath',90,NOW()),
  ('21111111-0000-4000-8000-000000000007','11111111-0000-4000-8000-000000000002',20,'Testtérkép','Hol érzed a feszültséget a testedben? Képzeld el, hogy kilégzéssel kiengeded onnan.','prompt',60,NOW()),
  ('21111111-0000-4000-8000-000000000008','11111111-0000-4000-8000-000000000002',30,'Választás: technika','Melyik technikát próbálod ma? (A) Légzés (B) Séta (C) Zene','choice',NULL,NOW()),
  ('21111111-0000-4000-8000-000000000009','11111111-0000-4000-8000-000000000002',40,'Nyújtó percek','Gyors nyújtások: nyak, vállak, karok. Figyeld, hogyan lazulnak el a feszültségek.','text',60,NOW()),
  ('21111111-0000-4000-8000-00000000000a','11111111-0000-4000-8000-000000000002',50,'Zárás','Hogy érzed magad most? Rövid jegyzet.','prompt',45,NOW()),

  -- Exp 3
  ('21111111-0000-4000-8000-00000000000b','11111111-0000-4000-8000-000000000003',10,'Első gondolatok','Gondolj egy helyzetre, ahol bizonytalan voltál. Mi jut eszedbe róla?','prompt',60,NOW()),
  ('21111111-0000-4000-8000-00000000000c','11111111-0000-4000-8000-000000000003',20,'Test és tartás','Állj egyenesen, tedd össze a vállakat, érezd, hogyan változik az energia.','text',45,NOW()),
  ('21111111-0000-4000-8000-00000000000d','11111111-0000-4000-8000-000000000003',30,'Választás: fókusz','Mire szeretnél fókuszálni az önbizalmadban? (A) Készségek (B) Megjelenés (C) Gondolkodás','choice',NULL,NOW()),
  ('21111111-0000-4000-8000-00000000000e','11111111-0000-4000-8000-000000000003',40,'Megismétlés','Mondj ki három pozitív kijelentést magadnak hangosan.','prompt',60,NOW()),
  ('21111111-0000-4000-8000-00000000000f','11111111-0000-4000-8000-000000000003',50,'Lezáró légzés','Helyezd a kezed a hasadra, lassú mély légzés 6-szor.','breath',60,NOW()),

  -- Exp 4
  ('21111111-0000-4000-8000-000000000010','11111111-0000-4000-8000-000000000004',10,'Nyitó kérdés','Emlékezz egy beszélgetésre, amikor jól érezted magad a másikkal. Mi történt?','prompt',60,NOW()),
  ('21111111-0000-4000-8000-000000000011','11111111-0000-4000-8000-000000000004',20,'Hallgatás gyakorlása','Figyelj 2 percig anélkül, hogy megszakítanád a másikat. Mi változott?','text',120,NOW()),
  ('21111111-0000-4000-8000-000000000012','11111111-0000-4000-8000-000000000004',30,'Választás: reakció','Hogyan reagálsz konfliktusban? (A) Hallgatok (B) Válaszolok azonnal (C) Kérdezek','choice',NULL,NOW()),
  ('21111111-0000-4000-8000-000000000013','11111111-0000-4000-8000-000000000004',40,'Záró reflektálás','Mit tanultál a hallgatási gyakorlatból?','prompt',90,NOW())
ON CONFLICT (id) DO UPDATE SET
  experience_id = EXCLUDED.experience_id,
  order_index = EXCLUDED.order_index,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  step_type = EXCLUDED.step_type,
  duration_sec = EXCLUDED.duration_sec,
  created_at = COALESCE(experience_steps.created_at, EXCLUDED.created_at);

COMMIT;

-- End of seed_content_v1.sql
