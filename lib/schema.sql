CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  teamA_name TEXT NOT NULL,
  teamB_name TEXT NOT NULL,
  teamA_token TEXT NOT NULL,
  teamB_token TEXT NOT NULL,
  map_pool TEXT NOT NULL, -- JSON array
  bans TEXT NOT NULL, -- JSON array
  current_turn TEXT CHECK (current_turn IN ('A', 'B') OR current_turn IS NULL),
  state TEXT NOT NULL CHECK (state IN ('created', 'in_progress', 'finished')),
  created_at TEXT NOT NULL,
  finished_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_matches_slug ON matches(slug);
CREATE INDEX IF NOT EXISTS idx_matches_state ON matches(state);
CREATE INDEX IF NOT EXISTS idx_matches_teamA_token ON matches(teamA_token);
CREATE INDEX IF NOT EXISTS idx_matches_teamB_token ON matches(teamB_token);
