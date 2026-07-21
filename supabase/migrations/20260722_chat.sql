-- Tabla de mensajes de chat
create table if not exists public.messages (
  id           uuid primary key default uuid_generate_v4(),
  trainer_id   uuid references public.trainers(id) on delete cascade not null,
  client_id    uuid references public.clients(id) on delete cascade not null,
  sender_role  text not null check (sender_role in ('trainer', 'client')),
  content      text not null,
  read_at      timestamptz,
  created_at   timestamptz default now()
);

alter table public.messages enable row level security;

-- El entrenador ve/envía mensajes de sus clientes
create policy "trainer_messages" on public.messages
  for all using (
    trainer_id in (select id from public.trainers where user_id = auth.uid())
  );

-- El cliente ve/envía sus propios mensajes
create policy "client_messages" on public.messages
  for all using (
    client_id in (select id from public.clients where user_id = auth.uid())
  );

-- Index para queries frecuentes
create index if not exists messages_trainer_client_idx on public.messages (trainer_id, client_id, created_at desc);

-- Habilitar Realtime en la tabla
alter publication supabase_realtime add table public.messages;
