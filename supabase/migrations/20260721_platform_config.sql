-- Platform configuration table for admin-managed settings (e.g. Stripe keys)
create table if not exists platform_config (
  key text primary key,
  value text not null,
  updated_at timestamptz default now()
);

alter table platform_config enable row level security;

-- Admin email list — only these users can read/write platform config
create policy "Admin read" on platform_config
  for select using (auth.jwt() ->> 'email' = 'info@ledorvador.us');

create policy "Admin write" on platform_config
  for all using (auth.jwt() ->> 'email' = 'info@ledorvador.us');
