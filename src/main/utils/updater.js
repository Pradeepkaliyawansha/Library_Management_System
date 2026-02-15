const { autoUpdater } = require("electron-updater");
const { dialog } = require("electron");
const log = require("electron-log");

let mainWindow;

function setupAutoUpdater(window) {
  mainWindow = window;

  // Configure logging
  autoUpdater.logger = log;
  autoUpdater.logger.transports.file.level = "info";
  log.info("Auto-updater initialized");

  // Don't auto-download - ask user first
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  // Event listeners
  autoUpdater.on("checking-for-update", () => {
    log.info("Checking for updates...");
    console.log("Checking for updates...");
  });

  autoUpdater.on("update-available", (info) => {
    log.info("Update available:", info.version);
    dialog
      .showMessageBox(mainWindow, {
        type: "info",
        title: "Update Available",
        message: `A new version ${info.version} is available!`,
        detail: `Current version: ${require("electron").app.getVersion()}\nNew version: ${info.version}\n\nDo you want to download it now?`,
        buttons: ["Download", "Later"],
        defaultId: 0,
      })
      .then((result) => {
        if (result.response === 0) {
          autoUpdater.downloadUpdate();
          mainWindow.webContents.send("update-downloading");
        }
      });
  });

  autoUpdater.on("update-not-available", (info) => {
    log.info("Update not available:", info.version);
    dialog.showMessageBox(mainWindow, {
      type: "info",
      title: "No Updates",
      message: "You are already using the latest version.",
      buttons: ["OK"],
    });
  });

  autoUpdater.on("error", (err) => {
    log.error("Update error:", err);
    dialog.showErrorBox(
      "Update Error",
      `Error checking for updates: ${err.message}`,
    );
  });

  autoUpdater.on("download-progress", (progressObj) => {
    const logMessage = `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`;
    log.info(logMessage);
    console.log(logMessage);
    mainWindow.webContents.send("update-progress", progressObj);
  });

  autoUpdater.on("update-downloaded", (info) => {
    log.info("Update downloaded:", info.version);
    dialog
      .showMessageBox(mainWindow, {
        type: "info",
        title: "Update Downloaded",
        message: "Update downloaded successfully!",
        detail: `Version ${info.version} has been downloaded.\n\nThe application will restart to apply the update.`,
        buttons: ["Restart Now", "Later"],
        defaultId: 0,
      })
      .then((result) => {
        if (result.response === 0) {
          setImmediate(() => autoUpdater.quitAndInstall());
        }
      });
  });

  // Don't check for updates automatically on startup
  // Updates will only be checked when user clicks "Check for Updates" in menu
}

function checkForUpdates() {
  if (process.env.NODE_ENV !== "development") {
    autoUpdater.checkForUpdates();
  } else {
    dialog.showMessageBox(mainWindow, {
      type: "info",
      title: "Development Mode",
      message: "Auto-update is disabled in development mode.",
      buttons: ["OK"],
    });
  }
}

module.exports = { setupAutoUpdater, checkForUpdates };
