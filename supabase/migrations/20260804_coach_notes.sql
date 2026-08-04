-- Create routine_item_notes table for per-client exercise notes
CREATE TABLE IF NOT EXISTS routine_item_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  routine_item_id UUID NOT NULL REFERENCES routine_items(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(routine_item_id, client_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_routine_item_notes_client_id ON routine_item_notes(client_id);
CREATE INDEX IF NOT EXISTS idx_routine_item_notes_routine_item_id ON routine_item_notes(routine_item_id);
