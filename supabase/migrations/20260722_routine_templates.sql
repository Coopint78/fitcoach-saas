-- Marcar una rutina como plantilla (opcional, para filtrar en UI)
alter table public.routines
  add column if not exists is_template boolean default false,
  add column if not exists description text;
