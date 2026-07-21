-- Stripe Connect: campos en trainers
alter table public.trainers
  add column if not exists connect_account_id text,
  add column if not exists connect_enabled boolean default false,
  add column if not exists coaching_price_cents integer default 0;

-- Stripe Connect: campos en clients
alter table public.clients
  add column if not exists coaching_stripe_customer_id text,
  add column if not exists coaching_subscription_id text,
  add column if not exists coaching_subscription_status text default 'none';

-- RLS: trainers ya tiene "trainer_own" (for all), lo nuevo está cubierto.
-- Clients: la policy existente "trainer_sees_clients" cubre los nuevos campos.
