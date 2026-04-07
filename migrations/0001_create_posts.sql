CREATE TABLE IF NOT EXISTS posts (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT    NOT NULL,
  slug        TEXT    NOT NULL UNIQUE,
  body        TEXT    NOT NULL DEFAULT '',
  description TEXT    NOT NULL DEFAULT '',
  tags        TEXT    NOT NULL DEFAULT '[]',
  type        TEXT    NOT NULL CHECK(type IN ('blog', 'projects')),
  status      TEXT    NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'wip', 'archived')),
  published   INTEGER NOT NULL DEFAULT 0,
  date        TEXT    NOT NULL,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(type);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);
