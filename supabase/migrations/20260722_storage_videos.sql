-- Bucket para videos de ejercicios
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'exercise-videos',
  'exercise-videos',
  true,
  104857600, -- 100 MB
  array['video/mp4', 'video/webm', 'video/quicktime', 'video/avi']
)
on conflict (id) do nothing;

-- Bucket para fotos de progreso (se usará en Feature 4)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'progress-photos',
  'progress-photos',
  false,
  10485760, -- 10 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- RLS Storage: solo el entrenador dueño puede subir/borrar en exercise-videos
create policy "trainer_upload_videos"
  on storage.objects for insert
  with check (
    bucket_id = 'exercise-videos'
    and auth.uid() is not null
  );

create policy "trainer_update_videos"
  on storage.objects for update
  using (bucket_id = 'exercise-videos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "trainer_delete_videos"
  on storage.objects for delete
  using (bucket_id = 'exercise-videos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "public_read_videos"
  on storage.objects for select
  using (bucket_id = 'exercise-videos');
