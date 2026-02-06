-- CHAT ROOMS
create table public.chat_rooms (
  id text primary key,
  name text not null,
  is_premium boolean not null default false,
  created_at timestamptz not null default now()
);

-- CHAT MESSAGES
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  room_id text not null references public.chat_rooms(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  content text not null,
  is_system boolean not null default false,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.chat_rooms enable row level security;
alter table public.chat_messages enable row level security;

-- Policies: chat_rooms
create policy "rooms_read_authed" on public.chat_rooms for select using (auth.role() = 'authenticated');
create policy "rooms_write_admin" on public.chat_rooms for all using (public.is_admin());

-- Policies: chat_messages
create policy "messages_read_authed" on public.chat_messages for select using (auth.role() = 'authenticated');
create policy "messages_insert_authed" on public.chat_messages for insert with check (auth.uid() = user_id);

-- Enable Realtime
-- This is a bit tricky depending on the platform, but for Supabase local/cloud:
-- alter publication supabase_realtime add table public.chat_messages;
-- Usually we use the Supabase dashboard or a specific SQL command if the publication exists.

-- Insert initial rooms
insert into public.chat_rooms (id, name, is_premium) values
  ('general', 'Kezdő Pont', false),
  ('meditation', 'Meditáció', false),
  ('gratitude', 'Hála Napló', false),
  ('premium', 'Mesterkurzus', true)
on conflict (id) do nothing;
