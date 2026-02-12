const { BrowserWindow } = require("electron");
const path = require("path");

let mainWindow = null;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    icon: path.join(__dirname, "../../build/icon.ico"),
    show: false, // Don't show until ready
  });

  // Load the index.html
  mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));

  // Show window when ready
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Handle window close
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Development mode
  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools();
  }

  return mainWindow;
}

// FIXED: Added getter function
function getMainWindow() {
  return mainWindow;
}

module.exports = { createMainWindow, getMainWindow };
