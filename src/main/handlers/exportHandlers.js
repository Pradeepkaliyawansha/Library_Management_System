const { ipcMain, dialog } = require("electron");
const exportService = require("../services/exportService");

// Export to Excel
ipcMain.handle("export-to-excel", async (event, { type, data }) => {
  try {
    // Format data for export
    const formattedData = exportService.formatDataForExport(type, data);

    // Create workbook
    const workbook = await exportService.createWorkbook(type, formattedData);

    // Show save dialog
    const { BrowserWindow } = require("electron");
    const mainWindow = BrowserWindow.getFocusedWindow();

    const result = await dialog.showSaveDialog(mainWindow, {
      title: `Export ${type} to Excel`,
      defaultPath: `library_${type.toLowerCase()}_${new Date().toISOString().split("T")[0]}.xlsx`,
      filters: [{ name: "Excel Files", extensions: ["xlsx"] }],
    });

    if (!result.canceled && result.filePath) {
      await workbook.xlsx.writeFile(result.filePath);
      return { success: true, filePath: result.filePath };
    }

    return { success: false, error: "Export cancelled" };
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    return { success: false, error: error.message };
  }
});

console.log("Export handlers registered");
