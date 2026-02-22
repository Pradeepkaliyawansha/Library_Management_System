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
require("./handlers/authHandlers"); // ← NEW

let mainWindow;

async function initialize() {
  try {
    await initDatabase();
    mainWindow = createMainWindow();
    createMenu(mainWindow);
    setupAutoUpdater(mainWindow);
  } catch (error) {
    console.error("=== FATAL: Failed to initialize application ===");
    console.error(error);
    const { dialog } = require("electron");
    dialog.showErrorBox(
      "Initialization Error",
      `Failed to start the application:\n\n${error.message}\n\nPlease restart the application.`,
    );
    app.quit();
  }
}

app.whenReady().then(initialize);

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) initialize();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", async (event) => {
  event.preventDefault();
  try {
    await closeDatabase();
  } catch (error) {
    console.error("Error closing database:", error);
  }
  app.exit(0);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

module.exports = { mainWindow };
