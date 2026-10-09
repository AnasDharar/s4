-- CTF Level 1 Schema for Supabase PostgreSQL

CREATE TABLE IF NOT EXISTS participants (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  college_name VARCHAR(255) NOT NULL,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  level1_completed BOOLEAN DEFAULT FALSE,
  level1_url TEXT,
  level1_completed_at TIMESTAMPTZ,
  level2_completed BOOLEAN DEFAULT FALSE,
  level2_completed_at TIMESTAMPTZ,
  level3_completed BOOLEAN DEFAULT FALSE,
  level3_completed_at TIMESTAMPTZ,
  total_completed INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS verification_logs (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES participants(id) ON DELETE CASCADE,
  user_name VARCHAR(255) NOT NULL,
  college_name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  status VARCHAR(50) NOT NULL, -- 'SUCCESS' or 'FAILED'
  eyebrow_match BOOLEAN DEFAULT FALSE,
  title_match BOOLEAN DEFAULT FALSE,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Additive migration for installations created from earlier versions.
ALTER TABLE verification_logs ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE verification_logs ADD COLUMN IF NOT EXISTS section_match BOOLEAN DEFAULT FALSE;
ALTER TABLE verification_logs ADD COLUMN IF NOT EXISTS h3_match BOOLEAN DEFAULT FALSE;
ALTER TABLE verification_logs ADD COLUMN IF NOT EXISTS hash_match BOOLEAN DEFAULT FALSE;

-- Index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_participants_leaderboard ON participants(level1_completed DESC, level1_completed_at ASC, registered_at ASC);
