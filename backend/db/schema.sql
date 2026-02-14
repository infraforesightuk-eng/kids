-- Profiles table for parental control
CREATE TABLE IF NOT EXISTS Profile (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  avatar TEXT,
  pin TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

-- Whitelist table for approved content per profile
CREATE TABLE IF NOT EXISTS Whitelist (
  id TEXT PRIMARY KEY,
  profileId TEXT NOT NULL,
  tmdbId TEXT NOT NULL,
  mediaType TEXT NOT NULL CHECK(mediaType IN ('movie', 'tv')),
  addedAt TEXT NOT NULL,
  UNIQUE(profileId, tmdbId, mediaType),
  FOREIGN KEY(profileId) REFERENCES Profile(id) ON DELETE CASCADE
);

-- Index for faster whitelist queries
CREATE INDEX IF NOT EXISTS idx_whitelist_profile ON Whitelist(profileId);

