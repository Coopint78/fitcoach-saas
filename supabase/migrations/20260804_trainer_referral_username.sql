-- Add username field for referral system
ALTER TABLE trainers ADD COLUMN username TEXT UNIQUE;
ALTER TABLE trainers ADD COLUMN referred_by_trainer_id UUID REFERENCES trainers(id) ON DELETE SET NULL;

-- Create indexes for fast lookups
CREATE INDEX idx_trainers_username ON trainers(username);
CREATE INDEX idx_trainers_referred_by ON trainers(referred_by_trainer_id);

-- Add constraint to ensure valid usernames (alphanumeric + underscore/dash only)
ALTER TABLE trainers ADD CONSTRAINT valid_username
  CHECK (username ~ '^[a-z0-9_-]{3,20}$' OR username IS NULL);
