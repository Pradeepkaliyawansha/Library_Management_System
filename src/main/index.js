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
    // Initialize database first
    await initDatabase();

    // Create main window
    mainWindow = createMainWindow();

    // Setup application menu
    createMenu(mainWindow);

    // Setup auto-updater
    setupAutoUpdater(mainWindow);

    console.log("Application initialized successfully");
  } catch (error) {
    console.error("Failed to initialize application:", error);
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

app.on("before-quit", async () => {
  await closeDatabase();
});

// Export for testing
module.exports = { mainWindow };
