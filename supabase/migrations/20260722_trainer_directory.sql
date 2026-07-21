-- Perfil público del entrenador
alter table public.trainers
  add column if not exists public_profile  boolean default false,
  add column if not exists specialty       text,
  add column if not exists location        text,
  add column if not exists profile_photo   text,
  add column if not exists instagram       text,
  add column if not exists website         text,
  add column if not exists client_count    integer default 0;

-- Policy: cualquiera puede ver el perfil público
create policy "public_trainer_profile" on public.trainers
  for select using (public_profile = true);
