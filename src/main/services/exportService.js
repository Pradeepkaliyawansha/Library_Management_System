const ExcelJS = require("exceljs");

class ExportService {
  async createWorkbook(type, data) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(type);

    worksheet.properties.defaultRowHeight = 20;

    let columns = [];
    let title = "";

    // Define columns based on type
    switch (type) {
      case "Students":
        title = "Students Report";
        columns = [
          { header: "Student ID", key: "student_id", width: 15 },
          { header: "Name", key: "name", width: 25 },
          { header: "Email", key: "email", width: 30 },
          { header: "Phone", key: "phone", width: 15 },
          { header: "Department", key: "department", width: 20 },
          { header: "Year", key: "year", width: 12 },
          { header: "Created At", key: "created_at", width: 20 },
        ];
        break;

      case "Books":
        title = "Books Report";
        columns = [
          { header: "ISBN", key: "isbn", width: 15 },
          { header: "Title", key: "title", width: 35 },
          { header: "Author", key: "author", width: 25 },
          { header: "Publisher", key: "publisher", width: 25 },
          { header: "Category", key: "category", width: 20 },
          { header: "Total Copies", key: "total_copies", width: 15 },
          { header: "Available Copies", key: "available_copies", width: 18 },
          { header: "Created At", key: "created_at", width: 20 },
        ];
        break;

      case "Transactions":
        title = "Transactions Report";
        columns = [
          { header: "Transaction ID", key: "id", width: 15 },
          { header: "Student ID", key: "student_id", width: 15 },
          { header: "Student Name", key: "student_name", width: 25 },
          { header: "ISBN", key: "isbn", width: 15 },
          { header: "Book Title", key: "book_title", width: 35 },
          { header: "Issue Date", key: "issue_date", width: 20 },
          { header: "Due Date", key: "due_date", width: 20 },
          { header: "Return Date", key: "return_date", width: 20 },
          { header: "Status", key: "status", width: 12 },
        ];
        break;
    }

    // Add title
    worksheet.mergeCells("A1", String.fromCharCode(64 + columns.length) + "1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = title;
    titleCell.font = { size: 16, bold: true, color: { argb: "FFFFFFFF" } };
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF667EEA" },
    };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };
    worksheet.getRow(1).height = 30;

    // Add generation date
    worksheet.mergeCells("A2", String.fromCharCode(64 + columns.length) + "2");
    const dateCell = worksheet.getCell("A2");
    dateCell.value = `Generated on: ${new Date().toLocaleString()}`;
    dateCell.font = { size: 10, italic: true };
    dateCell.alignment = { horizontal: "center" };

    // Set columns
    worksheet.columns = columns;

    // Style header row
    const headerRow = worksheet.getRow(3);
    columns.forEach((col, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = col.header;
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF764BA2" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
    headerRow.height = 25;

    // Add data rows
    data.forEach((item, index) => {
      const row = worksheet.addRow(item);
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "FFE0E0E0" } },
          left: { style: "thin", color: { argb: "FFE0E0E0" } },
          bottom: { style: "thin", color: { argb: "FFE0E0E0" } },
          right: { style: "thin", color: { argb: "FFE0E0E0" } },
        };
        cell.alignment = { vertical: "middle" };
      });

      // Alternate row colors
      if (index % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF8F9FA" },
          };
        });
      }
    });

    // Add summary row
    if (type === "Books" || type === "Transactions") {
      worksheet.addRow([]);
      const summaryRow = worksheet.addRow(["Total Records:", data.length]);
      summaryRow.font = { bold: true };
      summaryRow.getCell(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFEB3B" },
      };
      summaryRow.getCell(2).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFEB3B" },
      };
    }

    return workbook;
  }

  formatDataForExport(type, data) {
    switch (type) {
      case "Students":
        return data.map((s) => ({
          student_id: s.student_id,
          name: s.name,
          email: s.email,
          phone: s.phone || "N/A",
          department: s.department || "N/A",
          year: s.year || "N/A",
          created_at: new Date(s.created_at).toLocaleDateString(),
        }));

      case "Books":
        return data.map((b) => ({
          isbn: b.isbn,
          title: b.title,
          author: b.author,
          publisher: b.publisher || "N/A",
          category: b.category || "N/A",
          total_copies: b.total_copies,
          available_copies: b.available_copies,
          created_at: new Date(b.created_at).toLocaleDateString(),
        }));

      case "Transactions":
        return data.map((t) => ({
          id: t.id,
          student_id: t.student_id,
          student_name: t.student_name || "N/A",
          isbn: t.isbn,
          book_title: t.book_title || "N/A",
          issue_date: new Date(t.issue_date).toLocaleDateString(),
          due_date: t.due_date
            ? new Date(t.due_date).toLocaleDateString()
            : "N/A",
          return_date: t.return_date
            ? new Date(t.return_date).toLocaleDateString()
            : "Not Returned",
          status: t.status.toUpperCase(),
        }));

      default:
        return data;
    }
  }
}

module.exports = new ExportService();
