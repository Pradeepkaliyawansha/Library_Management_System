const { app, BrowserWindow } = require("electron");
const path = require("path");
const { initDatabase, closeDatabase } = require("./database/db");
const { createMenu } = require("./utils/menu");
const { setupAutoUpdater } = require("./utils/updater");
const { createMainWindow } = require("./window");

// Import all IPC handlers
require("./handlers/studentHandlers");
require("./handlers/bookHandlers");
require("./handlers/transactionHandlers");
require("./handlers/exportHandlers");

let mainWindow;

async function initialize() {
  try {
    console.log("=== Starting Library Management System ===");

    // Initialize database first
    console.log("Initializing database...");
    await initDatabase();
    console.log("✓ Database initialized");

    // Create main window
    console.log("Creating main window...");
    mainWindow = createMainWindow();
    console.log("✓ Main window created");

    // Setup application menu
    console.log("Setting up menu...");
    createMenu(mainWindow);
    console.log("✓ Menu configured");

    // Setup auto-updater
    console.log("Setting up auto-updater...");
    setupAutoUpdater(mainWindow);
    console.log("✓ Auto-updater configured");

    console.log("=== Application initialized successfully ===");
  } catch (error) {
    console.error("=== FATAL: Failed to initialize application ===");
    console.error(error);

    // Show error dialog
    const { dialog } = require("electron");
    dialog.showErrorBox(
      "Initialization Error",
      `Failed to start the application:\n\n${error.message}\n\nPlease restart the application.`,
    );

    app.quit();
  }
}

// App lifecycle events
app.whenReady().then(initialize);

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    initialize();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", async (event) => {
  console.log("Application shutting down...");
  event.preventDefault();

  try {
    await closeDatabase();
    console.log("✓ Database closed");
  } catch (error) {
    console.error("Error closing database:", error);
  }

  // Allow quit
  app.exit(0);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Export for testing
module.exports = { mainWindow };
