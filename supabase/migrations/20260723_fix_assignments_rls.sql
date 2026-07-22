-- Fix: assignments RLS policy needs WITH CHECK for INSERT operations
drop policy if exists "trainer_assignments" on public.assignments;

create policy "trainer_assignments" on public.assignments
  for all
  using (
    client_id in (
      select id from public.clients where trainer_id in (
        select id from public.trainers where user_id = auth.uid()
      )
    )
  )
  with check (
    client_id in (
      select id from public.clients where trainer_id in (
        select id from public.trainers where user_id = auth.uid()
      )
    )
  );
