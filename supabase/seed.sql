-- Experiences
insert into public.experiences (id, order_index, title, description, duration_min, is_premium, status, visibility, difficulty)
values 
  ('11111111-1111-1111-1111-111111111111', 1, 'Hullámvasút a félelmekkel', 'Tanulj meg együtt áramlani a félelmeiddel ezen az izgalmas belső utazáson.', 10, false, 'published', 'public', 'medium'),
  ('22222222-2222-2222-2222-222222222222', 2, 'Labirintus a döntésekhez', 'Segít tisztábban látni a válaszút előtt és megtalálni a belső iránytűdet.', 8, false, 'published', 'public', 'easy'),
  ('33333333-3333-3333-3333-333333333333', 3, 'Körkörös tükör', 'Mély önvizsgálat és reflexió a kapcsolataink tükrében.', 15, true, 'published', 'public', 'hard')
on conflict (id) do nothing;

-- Steps for Experience 1
insert into public.experience_steps (experience_id, order_index, title, content, step_type, duration_sec)
values 
  ('11111111-1111-1111-1111-111111111111', 0, 'Üdvözlet', 'Helyezkedj el kényelmesen, és figyeld meg a légzésedet.', 'text', 30),
  ('11111111-1111-1111-1111-111111111111', 1, 'Légzés', 'Vegyél három mély levegőt...', 'breath', 60),
  ('11111111-1111-1111-1111-111111111111', 2, 'Félelem vizualizáció', 'Képzeld el a félelmedet mint egy felhőt.', 'text', 120),
  ('11111111-1111-1111-1111-111111111111', 3, 'Elengedés', 'Hogyan érzed magad most?', 'prompt', 60)
on conflict (experience_id, order_index) do nothing;

-- Steps for Experience 2
insert into public.experience_steps (experience_id, order_index, title, content, step_type, duration_sec)
values 
  ('22222222-2222-2222-2222-222222222222', 0, 'A kereszteződés', 'Állj meg egy pillanatra fejben az útkereszteződésnél.', 'text', 30),
  ('22222222-2222-2222-2222-222222222222', 1, 'Bal vagy Jobb?', 'Melyik irány vonz jobban elsőre?', 'choice', 45),
  ('22222222-2222-2222-2222-222222222222', 2, 'Mélyebb ok', 'Miért választottad ezt az irányt?', 'prompt', 90),
  ('22222222-2222-2222-2222-222222222222', 3, 'Lezárás', 'Emlékezz, a döntésed mindig formálható.', 'text', 30)
on conflict (experience_id, order_index) do nothing;

-- Steps for Experience 3
insert into public.experience_steps (experience_id, order_index, title, content, step_type, duration_sec)
values 
  ('33333333-3333-3333-3333-333333333333', 0, 'Szembenézés', 'Nézz a képzeletbeli tükörbe.', 'text', 60),
  ('33333333-3333-3333-3333-333333333333', 1, 'Amit mások látnak', 'Mit gondolsz, mit látnak benned a szeretteid?', 'prompt', 180),
  ('33333333-3333-3333-3333-333333333333', 2, 'Az igazság', 'És te mit látsz, amikor senki nem néz?', 'prompt', 180),
  ('33333333-3333-3333-3333-333333333333', 3, 'Integráció', 'Öleld át mindkét képet.', 'breath', 120)
on conflict (experience_id, order_index) do nothing;
