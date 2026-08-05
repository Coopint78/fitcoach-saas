-- Fix missing RLS on routine_item_notes table
ALTER TABLE public.routine_item_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trainer_manage_routine_notes" ON public.routine_item_notes
  FOR ALL USING (
    routine_item_id IN (
      SELECT ri.id FROM routine_items ri
      JOIN routines r ON ri.routine_id = r.id
      WHERE r.trainer_id IN (SELECT id FROM trainers WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "client_view_routine_notes" ON public.routine_item_notes
  FOR SELECT USING (
    routine_item_id IN (
      SELECT ri.id FROM routine_items ri
      JOIN routines r ON ri.routine_id = r.id
      JOIN assignments a ON r.id = a.routine_id
      WHERE a.client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())
    )
  );

-- Fix missing RLS on referral_codes table
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trainer_manage_referral_codes" ON public.referral_codes
  FOR ALL USING (
    trainer_id IN (SELECT id FROM trainers WHERE user_id = auth.uid())
  );

CREATE POLICY "public_read_referral_codes" ON public.referral_codes
  FOR SELECT USING (true);
