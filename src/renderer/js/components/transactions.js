const api = require("../services/api");
const { showNotification } = require("../services/notifications");

class Transactions {
  constructor() {
    this.data = [];
    this.filteredData = [];
    this.operationInProgress = false;
    this.searchTimeout = null;

    this.initElements();
    this.setupEventListeners();
  }

  initElements() {
    this.tableBody = document.getElementById("transactionsTableBody");
    this.searchInput = document.getElementById("transactionSearch");
  }

  setupEventListeners() {
    // Search with debouncing
    this.searchInput.addEventListener("input", () => this.handleSearch());

    // Make functions globally available
    window.returnBook = (id) => this.returnBook(id);
    window.deleteTransaction = (id) => this.deleteTransaction(id);
    window.filterTransactions = () => this.handleSearch();
    window.exportTransactionsToExcel = () => this.exportToExcel();
  }

  async loadData() {
    try {
      this.data = await api.getTransactions();
      this.filteredData = [...this.data];
      this.render();
    } catch (error) {
      console.error("Error loading transactions:", error);
      showNotification("Error loading transactions", "error");
    }
  }

  render() {
    if (this.filteredData.length === 0) {
      this.tableBody.innerHTML =
        '<tr><td colspan="8" style="text-align: center;">No transactions found</td></tr>';
      return;
    }

    // Clear the table body first
    this.tableBody.innerHTML = "";

    // Create rows directly using DOM methods to ensure proper column structure
    this.filteredData.forEach((t) => {
      const issueDate = new Date(t.issue_date).toLocaleDateString();
      const dueDate = t.due_date
        ? new Date(t.due_date).toLocaleDateString()
        : "N/A";
      const returnDate = t.return_date
        ? new Date(t.return_date).toLocaleDateString()
        : "-";

      // Check if overdue
      const isOverdue =
        t.status === "issued" && new Date(t.due_date) < new Date();

      const row = document.createElement("tr");
      if (isOverdue) {
        row.className = "overdue-row";
      }

      // Student ID cell
      const studentIdCell = document.createElement("td");
      studentIdCell.textContent = t.student_id;
      row.appendChild(studentIdCell);

      // Student Name cell
      const studentNameCell = document.createElement("td");
      studentNameCell.textContent = t.student_name || "N/A";
      row.appendChild(studentNameCell);

      // ISBN cell (NEW!)
      const isbnCell = document.createElement("td");
      isbnCell.textContent = t.isbn || "N/A";
      isbnCell.style.fontFamily = "monospace"; // Better readability for ISBNs
      row.appendChild(isbnCell);

      // Book Title cell
      const bookTitleCell = document.createElement("td");
      bookTitleCell.textContent = t.book_title || "N/A";
      row.appendChild(bookTitleCell);

      // Issue Date cell
      const issueDateCell = document.createElement("td");
      issueDateCell.textContent = issueDate;
      row.appendChild(issueDateCell);

      // Due Date cell
      const dueDateCell = document.createElement("td");
      dueDateCell.textContent = dueDate;
      row.appendChild(dueDateCell);

      // Return Date cell
      const returnDateCell = document.createElement("td");
      returnDateCell.textContent = returnDate;
      row.appendChild(returnDateCell);

      // Status/Actions cell
      const actionsCell = document.createElement("td");
      const actionsDiv = document.createElement("div");
      actionsDiv.className = "table-actions";

      // Status badge
      const statusBadge = document.createElement("span");
      statusBadge.className = `status-badge status-${t.status}`;
      statusBadge.textContent = t.status.toUpperCase();
      actionsDiv.appendChild(statusBadge);

      // Return button (only for issued books)
      if (t.status === "issued") {
        const returnBtn = document.createElement("button");
        returnBtn.className = "btn-small btn-warning";
        returnBtn.textContent = "Return";
        returnBtn.onclick = () => this.returnBook(t.id);
        actionsDiv.appendChild(returnBtn);
      }

      // Delete button (only for returned books)
      if (t.status === "returned") {
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "btn-small btn-danger";
        deleteBtn.textContent = "Delete";
        deleteBtn.onclick = () => this.deleteTransaction(t.id);
        actionsDiv.appendChild(deleteBtn);
      }

      actionsCell.appendChild(actionsDiv);
      row.appendChild(actionsCell);

      this.tableBody.appendChild(row);
    });
  }

  handleSearch() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      const searchTerm = this.searchInput.value.toLowerCase();
      this.filteredData = this.data.filter(
        (t) =>
          t.student_id.toLowerCase().includes(searchTerm) ||
          (t.student_name &&
            t.student_name.toLowerCase().includes(searchTerm)) ||
          (t.book_title && t.book_title.toLowerCase().includes(searchTerm)) ||
          (t.isbn && t.isbn.toLowerCase().includes(searchTerm)), // NEW: Search by ISBN
      );
      this.render();
    }, 150);
  }

  async returnBook(transactionId) {
    if (this.operationInProgress) {
      showNotification("Please wait...", "warning");
      return;
    }

    if (confirm("Mark this book as returned?")) {
      this.operationInProgress = true;

      try {
        const result = await api.returnBook(transactionId);

        if (result.success) {
          showNotification("Book returned successfully!", "success");

          await this.loadData();

          if (window.app) {
            await window.app.components.books.loadData();
            await window.app.loadStatistics();
            window.app.components.dashboard.update(
              window.app.components.students.data,
              window.app.components.books.data,
            );
          }
        } else {
          showNotification(`Error: ${result.error}`, "error");
        }
      } catch (error) {
        showNotification(`Error: ${error.message}`, "error");
      } finally {
        this.operationInProgress = false;
      }
    }
  }

  async deleteTransaction(transactionId) {
    if (this.operationInProgress) {
      showNotification("Please wait...", "warning");
      return;
    }

    if (confirm("Are you sure you want to delete this transaction record?")) {
      this.operationInProgress = true;

      try {
        const result = await api.deleteTransaction(transactionId);

        if (result.success) {
          showNotification("Transaction deleted!", "success");
          await this.loadData();
        } else {
          showNotification(`Error: ${result.error}`, "error");
        }
      } catch (error) {
        showNotification(`Error: ${error.message}`, "error");
      } finally {
        this.operationInProgress = false;
      }
    }
  }

  async exportToExcel() {
    if (this.data.length === 0) {
      showNotification("No transactions to export!", "warning");
      return;
    }

    try {
      const result = await api.exportToExcel("Transactions", this.data);

      if (result.success) {
        showNotification("Transactions exported successfully!", "success");
      } else if (result.error !== "Export cancelled") {
        showNotification(`Export failed: ${result.error}`, "error");
      }
    } catch (error) {
      showNotification(`Export error: ${error.message}`, "error");
    }
  }

  getOverdueTransactions() {
    return this.data.filter(
      (t) => t.status === "issued" && new Date(t.due_date) < new Date(),
    );
  }

  getStatistics() {
    const issued = this.data.filter((t) => t.status === "issued").length;
    const returned = this.data.filter((t) => t.status === "returned").length;
    const overdue = this.getOverdueTransactions().length;

    return {
      total: this.data.length,
      issued,
      returned,
      overdue,
    };
  }

  destroy() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = null;
    }
  }
}

module.exports = Transactions;
