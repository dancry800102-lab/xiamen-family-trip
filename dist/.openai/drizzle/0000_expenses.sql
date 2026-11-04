CREATE TABLE expenses (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 title TEXT NOT NULL,
 cents INTEGER NOT NULL CHECK(cents > 0),
 payer TEXT NOT NULL,
 mode TEXT NOT NULL CHECK(mode IN ('all','adults','custom')),
 participants TEXT NOT NULL,
 request_id TEXT NOT NULL UNIQUE,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 deleted_at TEXT
);
