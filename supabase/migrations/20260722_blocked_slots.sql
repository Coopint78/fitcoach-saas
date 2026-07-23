-- Trainer availability exceptions: specific dates/times the trainer is NOT available
create table if not exists public.trainer_blocked_slots (
  id           uuid default gen_random_uuid() primary key,
  trainer_id   uuid not null references public.trainers(id) on delete cascade,
  blocked_date date not null,
  start_time   time,           -- null = all day
  end_time     time,           -- null = all day
  note         text,
  created_at   timestamptz default now()
);

alter table public.trainer_blocked_slots enable row level security;

create policy "blocked_slots_own" on public.trainer_blocked_slots
  for all
  using (
    trainer_id in (select id from public.trainers where user_id = auth.uid())
  )
  with check (
    trainer_id in (select id from public.trainers where user_id = auth.uid())
  );

create index if not exists idx_blocked_slots_trainer_date
  on public.trainer_blocked_slots (trainer_id, blocked_date);
