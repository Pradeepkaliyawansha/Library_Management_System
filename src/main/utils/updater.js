const { autoUpdater } = require("electron-updater");
const { dialog } = require("electron");

let mainWindow;

function setupAutoUpdater(window) {
  mainWindow = window;

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  // Event listeners
  autoUpdater.on("checking-for-update", () => {
    console.log("Checking for updates...");
  });

  autoUpdater.on("update-available", (info) => {
    dialog
      .showMessageBox(mainWindow, {
        type: "info",
        title: "Update Available",
        message: `A new version ${info.version} is available!`,
        detail: "Do you want to download it now?",
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

  autoUpdater.on("update-not-available", () => {
    dialog.showMessageBox(mainWindow, {
      type: "info",
      title: "No Updates",
      message: "You are already using the latest version.",
      buttons: ["OK"],
    });
  });

  autoUpdater.on("error", (err) => {
    dialog.showErrorBox(
      "Update Error",
      `Error checking for updates: ${err.message}`,
    );
  });

  autoUpdater.on("download-progress", (progressObj) => {
    const logMessage = `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`;
    console.log(logMessage);
    mainWindow.webContents.send("update-progress", progressObj);
  });

  autoUpdater.on("update-downloaded", (info) => {
    dialog
      .showMessageBox(mainWindow, {
        type: "info",
        title: "Update Downloaded",
        message: "Update downloaded successfully!",
        detail: "The application will restart to apply the update.",
        buttons: ["Restart Now", "Later"],
        defaultId: 0,
      })
      .then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
  });
}

function checkForUpdates() {
  autoUpdater.checkForUpdates();
}

module.exports = { setupAutoUpdater, checkForUpdates };
