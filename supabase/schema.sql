-- ─── Extensiones ──────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Trainers ──────────────────────────────────────────────────────────────
create table public.trainers (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid references auth.users(id) on delete cascade not null unique,
  name             text not null,
  email            text not null,
  bio              text,
  brand_color      text default '#6366f1',
  stripe_customer_id      text,
  stripe_subscription_id  text,
  subscription_status     text default 'trialing',
  trial_ends_at    timestamptz,
  created_at       timestamptz default now()
);

-- ─── Clients ───────────────────────────────────────────────────────────────
create table public.clients (
  id           uuid primary key default uuid_generate_v4(),
  trainer_id   uuid references public.trainers(id) on delete cascade not null,
  user_id      uuid references auth.users(id) on delete set null,
  name         text not null,
  email        text not null,
  goal         text,
  notes        text,
  invite_token text unique default encode(gen_random_bytes(32), 'hex'),
  invited_at   timestamptz,
  created_at   timestamptz default now()
);

-- ─── Exercises ─────────────────────────────────────────────────────────────
create table public.exercises (
  id           uuid primary key default uuid_generate_v4(),
  trainer_id   uuid references public.trainers(id) on delete cascade not null,
  name         text not null,
  description  text,
  video_url    text,
  created_at   timestamptz default now()
);

-- ─── Routines ──────────────────────────────────────────────────────────────
create table public.routines (
  id           uuid primary key default uuid_generate_v4(),
  trainer_id   uuid references public.trainers(id) on delete cascade not null,
  name         text not null,
  created_at   timestamptz default now()
);

-- ─── Routine Items ─────────────────────────────────────────────────────────
create table public.routine_items (
  id           uuid primary key default uuid_generate_v4(),
  routine_id   uuid references public.routines(id) on delete cascade not null,
  exercise_id  uuid references public.exercises(id) on delete cascade not null,
  sets         integer not null default 3,
  reps         text not null default '10',
  "order"      integer not null default 0
);

-- ─── Assignments ───────────────────────────────────────────────────────────
create table public.assignments (
  id           uuid primary key default uuid_generate_v4(),
  routine_id   uuid references public.routines(id) on delete cascade not null,
  client_id    uuid references public.clients(id) on delete cascade not null,
  assigned_at  timestamptz default now(),
  unique(routine_id, client_id)
);

-- ─── Progress Logs ─────────────────────────────────────────────────────────
create table public.progress_logs (
  id           uuid primary key default uuid_generate_v4(),
  client_id    uuid references public.clients(id) on delete cascade not null,
  exercise_id  uuid references public.exercises(id) on delete cascade not null,
  logged_at    timestamptz default now(),
  weight       numeric,
  completed    boolean default false
);

-- ─── Row Level Security ────────────────────────────────────────────────────
alter table public.trainers       enable row level security;
alter table public.clients        enable row level security;
alter table public.exercises      enable row level security;
alter table public.routines       enable row level security;
alter table public.routine_items  enable row level security;
alter table public.assignments    enable row level security;
alter table public.progress_logs  enable row level security;

-- Trainers: ven solo su propio perfil
create policy "trainer_own" on public.trainers
  for all using (auth.uid() = user_id);

-- Clients: el entrenador ve/edita sus clientes; el cliente ve su propio registro
create policy "trainer_sees_clients" on public.clients
  for all using (
    trainer_id in (select id from public.trainers where user_id = auth.uid())
  );

create policy "client_sees_self" on public.clients
  for select using (user_id = auth.uid());

-- Exercises: el entrenador ve/edita las suyas; el cliente ve las del entrenador que lo asignó
create policy "trainer_exercises" on public.exercises
  for all using (
    trainer_id in (select id from public.trainers where user_id = auth.uid())
  );

create policy "client_sees_exercises" on public.exercises
  for select using (
    trainer_id in (
      select trainer_id from public.clients where user_id = auth.uid()
    )
  );

-- Routines: igual que exercises
create policy "trainer_routines" on public.routines
  for all using (
    trainer_id in (select id from public.trainers where user_id = auth.uid())
  );

create policy "client_sees_routines" on public.routines
  for select using (
    id in (
      select a.routine_id from public.assignments a
      join public.clients c on c.id = a.client_id
      where c.user_id = auth.uid()
    )
  );

-- Routine Items
create policy "trainer_routine_items" on public.routine_items
  for all using (
    routine_id in (
      select id from public.routines where trainer_id in (
        select id from public.trainers where user_id = auth.uid()
      )
    )
  );

create policy "client_sees_routine_items" on public.routine_items
  for select using (
    routine_id in (
      select a.routine_id from public.assignments a
      join public.clients c on c.id = a.client_id
      where c.user_id = auth.uid()
    )
  );

-- Assignments
create policy "trainer_assignments" on public.assignments
  for all using (
    client_id in (
      select id from public.clients where trainer_id in (
        select id from public.trainers where user_id = auth.uid()
      )
    )
  );

create policy "client_sees_assignments" on public.assignments
  for select using (
    client_id in (select id from public.clients where user_id = auth.uid())
  );

-- Progress Logs: el cliente maneja los suyos; el entrenador puede leer los de sus clientes
create policy "client_progress" on public.progress_logs
  for all using (
    client_id in (select id from public.clients where user_id = auth.uid())
  );

create policy "trainer_reads_progress" on public.progress_logs
  for select using (
    client_id in (
      select id from public.clients where trainer_id in (
        select id from public.trainers where user_id = auth.uid()
      )
    )
  );

-- ─── Función: crear perfil de entrenador al registrarse ────────────────────
create or replace function public.handle_new_trainer()
returns trigger language plpgsql security definer as $$
begin
  if new.raw_user_meta_data->>'role' = 'trainer' then
    insert into public.trainers (user_id, name, email, trial_ends_at)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
      new.email,
      now() + interval '14 days'
    );
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_trainer();
