-- Sessions (calendar) table
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 60,
  title text,
  notes text,
  status text NOT NULL DEFAULT 'scheduled', -- scheduled | completed | cancelled | no_show
  requested_by text NOT NULL DEFAULT 'trainer', -- trainer | client
  confirmed_at timestamptz,
  completed_at timestamptz,
  client_rating integer, -- 1-5
  client_note text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trainer_sees_sessions" ON sessions
  FOR ALL USING (
    trainer_id IN (SELECT id FROM trainers WHERE user_id = auth.uid())
  );

CREATE POLICY "client_sees_sessions" ON sessions
  FOR ALL USING (
    client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())
  );

-- Trainer availability (weekly recurring slots)
CREATE TABLE IF NOT EXISTS trainer_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL, -- 0=Sunday, 1=Monday ... 6=Saturday
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(trainer_id, day_of_week, start_time)
);

ALTER TABLE trainer_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trainer_manages_availability" ON trainer_availability
  FOR ALL USING (
    trainer_id IN (SELECT id FROM trainers WHERE user_id = auth.uid())
  );

CREATE POLICY "client_sees_availability" ON trainer_availability
  FOR SELECT USING (
    trainer_id IN (SELECT trainer_id FROM clients WHERE user_id = auth.uid())
  );

-- Session duration and default settings on trainers
ALTER TABLE trainers
  ADD COLUMN IF NOT EXISTS session_duration_minutes integer NOT NULL DEFAULT 60;

-- Push notification tokens (for future mobile app)
CREATE TABLE IF NOT EXISTS push_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token text NOT NULL,
  platform text NOT NULL, -- ios | android | web
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, token)
);

ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_manages_own_tokens" ON push_tokens
  FOR ALL USING (user_id = auth.uid());

-- Enable Realtime on sessions
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
