-- Referral short codes table
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL REFERENCES public.trainers(id) ON DELETE CASCADE,
  short_code text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_referral_codes_trainer ON public.referral_codes(trainer_id);
CREATE INDEX idx_referral_codes_short_code ON public.referral_codes(short_code);

-- Modify trainers table to split location into components
ALTER TABLE public.trainers
  DROP COLUMN IF EXISTS location,
  ADD COLUMN location_country text,
  ADD COLUMN location_state text,
  ADD COLUMN location_city text,
  ADD COLUMN location_zip_code text;
