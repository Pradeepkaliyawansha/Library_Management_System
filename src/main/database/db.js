const { app } = require("electron");
const path = require("path");
const fs = require("fs");
const initSqlJs = require("sql.js");
const { runMigrations } = require("./migrations");

let db;
let SQL;
let saveTimeout = null;
let isDirty = false; // Only save when data actually changed

const DB_PATH = path.join(app.getPath("userData"), "library.db");
const SAVE_DELAY = 1000; // Batch writes - 1s instead of 300ms

async function initDatabase() {
  try {
    console.time("[DB] SQL.js init");

    SQL = await initSqlJs({
      locateFile: (file) =>
        path.join(__dirname, "../../../node_modules/sql.js/dist", file),
    });

    console.timeEnd("[DB] SQL.js init");
    console.time("[DB] Load file");

    if (fs.existsSync(DB_PATH)) {
      // Sync read is fine here - it's a one-time startup cost and
      // avoids the overhead of async event loop for a single read
      const buffer = fs.readFileSync(DB_PATH);
      db = new SQL.Database(buffer);
    } else {
      db = new SQL.Database();
    }

    console.timeEnd("[DB] Load file");

    // Performance pragmas - safe for desktop app (no power loss risk)
    db.run("PRAGMA journal_mode = MEMORY;"); // No journal file I/O
    db.run("PRAGMA synchronous = OFF;"); // Don't fsync after each write
    db.run("PRAGMA cache_size = 10000;"); // ~10MB page cache
    db.run("PRAGMA temp_store = MEMORY;"); // Temp tables in RAM

    // Run migrations to ensure schema is up to date
    await runMigrations(db);

    // Save only if new DB was created (migrations wrote data)
    if (!fs.existsSync(DB_PATH)) {
      await saveDatabase();
    }

    return db;
  } catch (error) {
    console.error("[DB] Initialization error:", error);
    throw error;
  }
}

async function saveDatabase() {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    await fs.promises.writeFile(DB_PATH, buffer);
    isDirty = false;
  } catch (error) {
    console.error("[DB] Save error:", error);
    throw error;
  }
}

function debouncedSave() {
  isDirty = true;

  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  saveTimeout = setTimeout(async () => {
    if (isDirty) {
      await saveDatabase();
    }
  }, SAVE_DELAY);
}

async function closeDatabase() {
  try {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    // Always save on close if dirty
    if (isDirty && db) {
      await saveDatabase();
    }
    if (db) {
      db.close();
    }
  } catch (error) {
    console.error("[DB] Close error:", error);
  }
}

function getDatabase() {
  if (!db) {
    throw new Error("Database not initialized");
  }
  return db;
}

function executeQuery(query, params = []) {
  try {
    return db.exec(query, params);
  } catch (error) {
    console.error("[DB] Query error:", error);
    throw error;
  }
}

function runQuery(query, params = []) {
  try {
    db.run(query, params);
    debouncedSave();
  } catch (error) {
    console.error("[DB] Run error:", error);
    throw error;
  }
}

module.exports = {
  initDatabase,
  saveDatabase,
  debouncedSave,
  closeDatabase,
  getDatabase,
  executeQuery,
  runQuery,
};
