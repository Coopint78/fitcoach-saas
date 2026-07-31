-- Tabla de fotos de progreso por cliente
create table if not exists client_photos (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  trainer_id uuid not null references trainers(id) on delete cascade,
  url text not null,
  taken_at date not null default current_date,
  note text,
  shared_with_client boolean not null default false,
  created_at timestamptz not null default now()
);

-- Tabla de comparaciones compartidas con el cliente
create table if not exists client_photo_comparisons (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  trainer_id uuid not null references trainers(id) on delete cascade,
  photo_before_id uuid not null references client_photos(id) on delete cascade,
  photo_after_id uuid not null references client_photos(id) on delete cascade,
  shared_with_client boolean not null default false,
  created_at timestamptz not null default now()
);

-- RLS
alter table client_photos enable row level security;
alter table client_photo_comparisons enable row level security;

-- El entrenador ve y gestiona todas las fotos de sus clientes
create policy "trainer_manage_photos"
  on client_photos for all
  using (trainer_id = (select id from trainers where user_id = auth.uid()));

-- El cliente solo ve las fotos que le compartieron
create policy "client_view_shared_photos"
  on client_photos for select
  using (
    shared_with_client = true
    and client_id in (select id from clients where user_id = auth.uid())
  );

-- El entrenador gestiona comparaciones
create policy "trainer_manage_comparisons"
  on client_photo_comparisons for all
  using (trainer_id = (select id from trainers where user_id = auth.uid()));

-- El cliente ve comparaciones compartidas
create policy "client_view_shared_comparisons"
  on client_photo_comparisons for select
  using (
    shared_with_client = true
    and client_id in (select id from clients where user_id = auth.uid())
  );

-- RLS Storage para progress-photos: el entrenador puede subir/leer
create policy "trainer_upload_progress_photos"
  on storage.objects for insert
  with check (
    bucket_id = 'progress-photos'
    and auth.uid() is not null
  );

create policy "trainer_read_progress_photos"
  on storage.objects for select
  using (
    bucket_id = 'progress-photos'
    and auth.uid() is not null
  );

create policy "trainer_delete_progress_photos"
  on storage.objects for delete
  using (
    bucket_id = 'progress-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
