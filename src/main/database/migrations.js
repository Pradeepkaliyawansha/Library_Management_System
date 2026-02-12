async function runMigrations(db) {
  console.log("Running database migrations...");

  // Create students table
  db.run(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      department TEXT,
      year TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create books table
  db.run(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      isbn TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      publisher TEXT,
      category TEXT,
      total_copies INTEGER DEFAULT 1,
      available_copies INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create transactions table
  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL,
      isbn TEXT NOT NULL,
      issue_date TEXT DEFAULT CURRENT_TIMESTAMP,
      due_date TEXT,
      return_date TEXT,
      status TEXT DEFAULT 'issued',
      FOREIGN KEY (student_id) REFERENCES students(student_id),
      FOREIGN KEY (isbn) REFERENCES books(isbn)
    );
  `);

  // Create indexes for better performance
  try {
    db.run("CREATE INDEX IF NOT EXISTS idx_student_id ON students(student_id)");
    db.run("CREATE INDEX IF NOT EXISTS idx_book_isbn ON books(isbn)");
    db.run(
      "CREATE INDEX IF NOT EXISTS idx_trans_student ON transactions(student_id)",
    );
    db.run("CREATE INDEX IF NOT EXISTS idx_trans_isbn ON transactions(isbn)");
    db.run(
      "CREATE INDEX IF NOT EXISTS idx_trans_status ON transactions(status)",
    );
    console.log("Indexes created successfully");
  } catch (error) {
    console.log("Index creation (may already exist):", error.message);
  }

  // Check and add due_date column if it doesn't exist (migration)
  try {
    const checkColumn = db.exec("PRAGMA table_info(transactions)");
    if (checkColumn.length > 0) {
      const columns = checkColumn[0].values.map((row) => row[1]);
      if (!columns.includes("due_date")) {
        db.run("ALTER TABLE transactions ADD COLUMN due_date TEXT");
        console.log("Added due_date column to transactions table");
      }
    }
  } catch (error) {
    console.log("Column check/migration:", error.message);
  }

  console.log("Database migrations completed");
}

module.exports = { runMigrations };
