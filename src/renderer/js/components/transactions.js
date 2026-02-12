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
        '<tr><td colspan="7" style="text-align: center;">No transactions found</td></tr>';
      return;
    }

    this.tableBody.innerHTML = this.filteredData
      .map((t) => {
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

        // Determine which buttons to show
        let deleteButton = "";
        if (t.status === "returned") {
          deleteButton = `<button class="btn-small btn-danger" onclick="deleteTransaction(${t.id})">Delete</button>`;
        }

        return `
          <tr class="${isOverdue ? "overdue-row" : ""}">
            <td>${t.student_id}</td>
            <td>${t.student_name || "N/A"}</td>
            <td>${t.book_title || "N/A"}</td>
            <td>${issueDate}</td>
            <td>${dueDate}</td>
            <td>${returnDate}</td>
            <td>
              <div class="table-actions">
                <span class="status-badge status-${t.status}">${t.status.toUpperCase()}</span>
                ${t.status === "issued" ? `<button class="btn-small btn-warning" onclick="returnBook(${t.id})">Return</button>` : ""}
                ${deleteButton}
              </div>
            </td>
          </tr>
        `;
      })
      .join("");
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
          (t.book_title && t.book_title.toLowerCase().includes(searchTerm)),
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

          // Reload transactions, books, and statistics
          await this.loadData();

          if (window.app) {
            await window.app.components.books.loadData();
            await window.app.loadStatistics();
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

  // Helper method to get overdue transactions
  getOverdueTransactions() {
    return this.data.filter(
      (t) => t.status === "issued" && new Date(t.due_date) < new Date(),
    );
  }

  // Helper method to get statistics
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
}

module.exports = Transactions;
