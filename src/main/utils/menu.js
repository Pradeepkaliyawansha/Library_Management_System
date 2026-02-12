const { Menu, dialog, shell, app } = require("electron");

function createMenu(mainWindow) {
  const template = [
    {
      label: "File",
      submenu: [
        {
          label: "Export Data",
          submenu: [
            {
              label: "Export Students",
              click: () => {
                mainWindow.webContents.send("export-students");
              },
            },
            {
              label: "Export Books",
              click: () => {
                mainWindow.webContents.send("export-books");
              },
            },
            {
              label: "Export Transactions",
              click: () => {
                mainWindow.webContents.send("export-transactions");
              },
            },
          ],
        },
        { type: "separator" },
        {
          label: "Backup Database",
          click: async () => {
            const fs = require("fs");
            const path = require("path");

            const result = await dialog.showSaveDialog(mainWindow, {
              title: "Backup Database",
              defaultPath: `library_backup_${new Date().toISOString().split("T")[0]}.db`,
              filters: [{ name: "Database Files", extensions: ["db"] }],
            });

            if (!result.canceled && result.filePath) {
              try {
                const dbPath = path.join(app.getPath("userData"), "library.db");
                await fs.promises.copyFile(dbPath, result.filePath);
                dialog.showMessageBox(mainWindow, {
                  type: "info",
                  title: "Backup Successful",
                  message: "Database backup created successfully!",
                  buttons: ["OK"],
                });
              } catch (error) {
                dialog.showErrorBox("Backup Failed", error.message);
              }
            }
          },
        },
        {
          label: "Restore Database",
          click: async () => {
            const fs = require("fs");
            const path = require("path");

            const result = await dialog.showOpenDialog(mainWindow, {
              title: "Restore Database",
              filters: [{ name: "Database Files", extensions: ["db"] }],
              properties: ["openFile"],
            });

            if (!result.canceled && result.filePaths.length > 0) {
              const confirmRestore = await dialog.showMessageBox(mainWindow, {
                type: "warning",
                title: "Confirm Restore",
                message:
                  "This will replace your current database. Are you sure?",
                buttons: ["Cancel", "Restore"],
                defaultId: 0,
                cancelId: 0,
              });

              if (confirmRestore.response === 1) {
                try {
                  const dbPath = path.join(
                    app.getPath("userData"),
                    "library.db",
                  );
                  await fs.promises.copyFile(result.filePaths[0], dbPath);
                  dialog.showMessageBox(mainWindow, {
                    type: "info",
                    title: "Restore Successful",
                    message:
                      "Database restored successfully! Please restart the application.",
                    buttons: ["OK"],
                  });
                } catch (error) {
                  dialog.showErrorBox("Restore Failed", error.message);
                }
              }
            }
          },
        },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "Check for Updates",
          click: () => {
            const { checkForUpdates } = require("./updater");
            checkForUpdates();
          },
        },
        { type: "separator" },
        {
          label: "About",
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: "info",
              title: "About Library Management System",
              message: "Library Management System",
              detail: `Version: ${app.getVersion()}\n\nA comprehensive library management solution for universities.\n\nLicense: MIT`,
              buttons: ["OK"],
            });
          },
        },
        {
          label: "Documentation",
          click: async () => {
            await shell.openExternal(
              "https://github.com/Pradeepkaliyawansha/Library_Management_System",
            );
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

module.exports = { createMenu };
