async function runMigrations(db) {
  console.log("Running database migrations...");

  db.run(`
    CREATE TABLE IF NOT EXISTS students (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT    UNIQUE NOT NULL,
      name       TEXT    NOT NULL,
      email      TEXT    NOT NULL,
      phone      TEXT,
      department TEXT,
      year       TEXT,
      created_at TEXT    DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS books (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      isbn             TEXT    UNIQUE NOT NULL,
      title            TEXT    NOT NULL,
      author           TEXT    NOT NULL,
      publisher        TEXT,
      category         TEXT,
      total_copies     INTEGER DEFAULT 1,
      available_copies INTEGER DEFAULT 1,
      created_at       TEXT    DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id  TEXT    NOT NULL,
      isbn        TEXT    NOT NULL,
      issue_date  TEXT    DEFAULT CURRENT_TIMESTAMP,
      due_date    TEXT,
      return_date TEXT,
      status      TEXT    DEFAULT 'issued',
      FOREIGN KEY (student_id) REFERENCES students(student_id),
      FOREIGN KEY (isbn)       REFERENCES books(isbn)
    );
  `);

  // Core lookup indexes
  const indexes = [
    "CREATE INDEX IF NOT EXISTS idx_student_id    ON students(student_id)",
    "CREATE INDEX IF NOT EXISTS idx_book_isbn     ON books(isbn)",
    "CREATE INDEX IF NOT EXISTS idx_trans_student ON transactions(student_id)",
    "CREATE INDEX IF NOT EXISTS idx_trans_isbn    ON transactions(isbn)",
    "CREATE INDEX IF NOT EXISTS idx_trans_status  ON transactions(status)",
    // Critical for ORDER BY issue_date DESC (the default sort)
    "CREATE INDEX IF NOT EXISTS idx_trans_date    ON transactions(issue_date DESC)",
    // Composite index speeds up the duplicate-check query
    "CREATE INDEX IF NOT EXISTS idx_trans_dup     ON transactions(student_id, isbn, status)",
  ];

  indexes.forEach((sql) => {
    try {
      db.run(sql);
    } catch (e) {
      console.log("Index (may exist):", e.message);
    }
  });

  // Column migration: add due_date if missing (legacy DBs)
  try {
    const info = db.exec("PRAGMA table_info(transactions)");
    if (info.length > 0) {
      const cols = info[0].values.map((r) => r[1]);
      if (!cols.includes("due_date")) {
        db.run("ALTER TABLE transactions ADD COLUMN due_date TEXT");
        console.log("Migrated: added due_date column");
      }
    }
  } catch (e) {
    console.log("Column migration:", e.message);
  }

  console.log("Database migrations completed");
}

module.exports = { runMigrations };
