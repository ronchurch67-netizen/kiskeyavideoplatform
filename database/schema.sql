CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  ui_language TEXT NOT NULL DEFAULT 'ht',
  plan TEXT NOT NULL DEFAULT 'basic',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  idea_text TEXT NOT NULL,
  content_language TEXT NOT NULL,
  style TEXT NOT NULL DEFAULT 'realistic',
  duration_seconds REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  scenes_json TEXT,
  video_file_name TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
