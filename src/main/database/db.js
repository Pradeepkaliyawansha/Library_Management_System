const { app } = require("electron");
const path = require("path");
const fs = require("fs");
const initSqlJs = require("sql.js");
const { runMigrations } = require("./migrations");

let db;
let SQL;
let saveTimeout = null;

const DB_PATH = path.join(app.getPath("userData"), "library.db");
const SAVE_DELAY = 300; // milliseconds

async function initDatabase() {
  try {
    // Initialize SQL.js
    SQL = await initSqlJs({
      locateFile: (file) =>
        path.join(__dirname, "../../../node_modules/sql.js/dist", file),
    });

    // Load existing database or create new one
    if (fs.existsSync(DB_PATH)) {
      const buffer = fs.readFileSync(DB_PATH);
      db = new SQL.Database(buffer);
      console.log("Database loaded from:", DB_PATH);
    } else {
      db = new SQL.Database();
      console.log("New database created");
    }

    // Run migrations to ensure schema is up to date
    await runMigrations(db);

    // Initial save
    await saveDatabase();

    console.log("Database initialized successfully");
    return db;
  } catch (error) {
    console.error("Database initialization error:", error);
    throw error;
  }
}

async function saveDatabase() {
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    await fs.promises.writeFile(DB_PATH, buffer);
    console.log("Database saved");
  } catch (error) {
    console.error("Error saving database:", error);
    throw error;
  }
}

function debouncedSave() {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  saveTimeout = setTimeout(async () => {
    await saveDatabase();
  }, SAVE_DELAY);
}

async function closeDatabase() {
  try {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      await saveDatabase();
    }
    if (db) {
      db.close();
    }
    console.log("Database closed");
  } catch (error) {
    console.error("Error closing database:", error);
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
    const result = db.exec(query, params);
    return result;
  } catch (error) {
    console.error("Query execution error:", error);
    throw error;
  }
}

function runQuery(query, params = []) {
  try {
    db.run(query, params);
    debouncedSave();
  } catch (error) {
    console.error("Query execution error:", error);
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
