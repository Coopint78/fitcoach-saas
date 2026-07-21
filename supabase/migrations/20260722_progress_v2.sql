-- Ampliar progress_logs para métricas corporales y fotos
alter table public.progress_logs
  add column if not exists waist_cm    numeric,
  add column if not exists hips_cm     numeric,
  add column if not exists chest_cm    numeric,
  add column if not exists notes       text,
  add column if not exists photo_url   text;

-- Tabla separada para peso corporal diario (más granular que progress_logs por ejercicio)
create table if not exists public.body_metrics (
  id          uuid primary key default uuid_generate_v4(),
  client_id   uuid references public.clients(id) on delete cascade not null,
  logged_at   timestamptz default now(),
  weight_kg   numeric,
  waist_cm    numeric,
  hips_cm     numeric,
  chest_cm    numeric,
  notes       text,
  photo_url   text
);

alter table public.body_metrics enable row level security;

create policy "client_body_metrics" on public.body_metrics
  for all using (
    client_id in (select id from public.clients where user_id = auth.uid())
  );

create policy "trainer_reads_body_metrics" on public.body_metrics
  for select using (
    client_id in (
      select id from public.clients where trainer_id in (
        select id from public.trainers where user_id = auth.uid()
      )
    )
  );

create index if not exists body_metrics_client_idx on public.body_metrics (client_id, logged_at desc);
