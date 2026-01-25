CREATE TABLE categories (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL CHECK (name != '') DEFAULT 'Untitled',
  icon TEXT,
  position INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE pads (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  category_id TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'Untitled',
  description TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '#18A058',
  icon TEXT,
  type TEXT NOT NULL CHECK (type IN ('clipboard', 'url', 'app')),
  clipboard_json TEXT,
  clipboard_text TEXT,
  target TEXT,
  hotkey TEXT,
  position INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  CHECK (
    (type = 'clipboard'
      AND clipboard_json IS NOT NULL
      AND clipboard_text IS NOT NULL
      AND target IS NULL)
    OR
    (type IN ('url', 'app')
      AND target IS NOT NULL
      AND clipboard_json IS NULL
      AND clipboard_text IS NULL)
  ),
  FOREIGN KEY (category_id)
    REFERENCES categories (id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_categories_order ON categories(position);
CREATE INDEX IF NOT EXISTS idx_pads_category_order ON pads(category_id, position);