CREATE TABLE mochi (
  id TEXT PRIMARY KEY NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  bytes INTEGER NOT NULL CHECK (bytes > 0 AND bytes <= 131072),
  downloads INTEGER NOT NULL DEFAULT 0 CHECK (downloads >= 0)
);
CREATE INDEX mochi_recent ON mochi(created_at DESC, id DESC);
CREATE INDEX mochi_popular ON mochi(downloads DESC, created_at DESC, id DESC);
