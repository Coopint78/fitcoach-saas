-- Public clients: users who registered via mobile app looking for a trainer
create table if not exists public.public_clients (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid not null references auth.users(id) on delete cascade,
  name         text not null,
  email        text not null,
  goal         text,
  location     text,
  created_at   timestamptz default now()
);
alter table public.public_clients enable row level security;
create policy "public_clients_own" on public.public_clients
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Coaching requests: client -> trainer contact
create table if not exists public.coaching_requests (
  id           uuid default gen_random_uuid() primary key,
  trainer_id   uuid not null references public.trainers(id) on delete cascade,
  client_id    uuid not null references public.public_clients(id) on delete cascade,
  message      text,
  status       text not null default 'pending', -- pending | accepted | rejected
  created_at   timestamptz default now()
);
alter table public.coaching_requests enable row level security;
-- Trainer can see requests addressed to them
create policy "coaching_requests_trainer" on public.coaching_requests
  for all using (
    trainer_id in (select id from public.trainers where user_id = auth.uid())
  );
-- Client can see their own requests
create policy "coaching_requests_client" on public.coaching_requests
  for select using (
    client_id in (select id from public.public_clients where user_id = auth.uid())
  );
create policy "coaching_requests_client_insert" on public.coaching_requests
  for insert with check (
    client_id in (select id from public.public_clients where user_id = auth.uid())
  );

create index if not exists idx_coaching_requests_trainer on public.coaching_requests(trainer_id, status);
create index if not exists idx_coaching_requests_client on public.coaching_requests(client_id);

-- Push tokens for notifications
create table if not exists public.push_tokens (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid not null references auth.users(id) on delete cascade unique,
  token       text not null,
  updated_at  timestamptz default now()
);
alter table public.push_tokens enable row level security;
create policy "push_tokens_own" on public.push_tokens
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Add user_id to clients table so existing clients can log in via app
alter table public.clients add column if not exists user_id uuid references auth.users(id);
create index if not exists idx_clients_user_id on public.clients(user_id);
