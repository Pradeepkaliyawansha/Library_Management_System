const api = require("../services/api");
const { showNotification } = require("../services/notifications");

class Transactions {
  constructor() {
    this.data = [];
    this.filteredData = [];
    this.operationInProgress = false;
    this.searchTimeout = null;
    this.isRendering = false;

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
    // Prevent multiple simultaneous renders
    if (this.isRendering) {
      return;
    }

    this.isRendering = true;

    // Use requestAnimationFrame for smooth rendering
    requestAnimationFrame(() => {
      this._performRender();
      this.isRendering = false;
    });
  }

  _performRender() {
    if (this.filteredData.length === 0) {
      this.tableBody.innerHTML =
        '<tr><td colspan="8" style="text-align: center;">No transactions found</td></tr>';
      return;
    }

    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();

    this.filteredData.forEach((t) => {
      const row = this._createTransactionRow(t);
      fragment.appendChild(row);
    });

    // Single DOM update
    this.tableBody.innerHTML = "";
    this.tableBody.appendChild(fragment);
  }

  _createTransactionRow(t) {
    const issueDate = new Date(t.issue_date).toLocaleDateString();
    const dueDate = t.due_date
      ? new Date(t.due_date).toLocaleDateString()
      : "N/A";
    const returnDate = t.return_date
      ? new Date(t.return_date).toLocaleDateString()
      : "-";

    const isOverdue =
      t.status === "issued" && new Date(t.due_date) < new Date();

    const row = document.createElement("tr");
    if (isOverdue) {
      row.className = "overdue-row";
    }

    // Store transaction ID as data attribute for faster access
    row.dataset.transactionId = t.id;

    // Build row HTML in one go for better performance
    row.innerHTML = `
      <td>${this._escapeHtml(t.student_id)}</td>
      <td>${this._escapeHtml(t.student_name || "N/A")}</td>
      <td style="font-family: monospace">${this._escapeHtml(t.isbn || "N/A")}</td>
      <td>${this._escapeHtml(t.book_title || "N/A")}</td>
      <td>${issueDate}</td>
      <td>${dueDate}</td>
      <td>${returnDate}</td>
      <td>
        <div class="table-actions">
          ${this._getStatusBadgeHtml(t.status)}
          ${this._getActionButtonsHtml(t)}
        </div>
      </td>
    `;

    // Add event listeners after row creation
    this._attachEventListeners(row, t);

    return row;
  }

  _getStatusBadgeHtml(status) {
    return `<span class="status-badge status-${status}">${status.toUpperCase()}</span>`;
  }

  _getActionButtonsHtml(transaction) {
    if (transaction.status === "issued") {
      return `<button class="btn-small btn-warning return-btn" data-id="${transaction.id}">Return</button>`;
    } else if (transaction.status === "returned") {
      return `<button class="btn-small btn-danger delete-btn" data-id="${transaction.id}">Delete</button>`;
    }
    return "";
  }

  _attachEventListeners(row, transaction) {
    // Use event delegation for better performance
    const returnBtn = row.querySelector(".return-btn");
    const deleteBtn = row.querySelector(".delete-btn");

    if (returnBtn) {
      returnBtn.onclick = (e) => {
        e.stopPropagation();
        this.returnBook(transaction.id);
      };
    }

    if (deleteBtn) {
      deleteBtn.onclick = (e) => {
        e.stopPropagation();
        this.deleteTransaction(transaction.id);
      };
    }
  }

  handleSearch() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      const searchTerm = this.searchInput.value.toLowerCase();

      if (!searchTerm) {
        this.filteredData = [...this.data];
      } else {
        this.filteredData = this.data.filter(
          (t) =>
            t.student_id.toLowerCase().includes(searchTerm) ||
            (t.student_name &&
              t.student_name.toLowerCase().includes(searchTerm)) ||
            (t.book_title && t.book_title.toLowerCase().includes(searchTerm)) ||
            (t.isbn && t.isbn.toLowerCase().includes(searchTerm)),
        );
      }

      this.render();
    }, 150);
  }

  async returnBook(transactionId) {
    if (this.operationInProgress) {
      showNotification("Please wait...", "warning");
      return;
    }

    if (!confirm("Mark this book as returned?")) {
      return;
    }

    this.operationInProgress = true;

    // Show loading state on the specific row
    this._showRowLoading(transactionId);

    try {
      const result = await api.returnBook(transactionId);

      if (result.success) {
        showNotification("Book returned successfully!", "success");

        // Optimistic UI update - update only the affected row
        this._optimisticUpdateReturn(transactionId);

        // Update statistics in background
        this._updateStatisticsInBackground();

        // Reload full data in background
        this.loadData();
      } else {
        showNotification(`Error: ${result.error}`, "error");
        this._removeRowLoading(transactionId);
      }
    } catch (error) {
      showNotification(`Error: ${error.message}`, "error");
      this._removeRowLoading(transactionId);
    } finally {
      this.operationInProgress = false;
    }
  }

  async deleteTransaction(transactionId) {
    if (this.operationInProgress) {
      showNotification("Please wait...", "warning");
      return;
    }

    if (!confirm("Are you sure you want to delete this transaction record?")) {
      return;
    }

    this.operationInProgress = true;

    // Show loading state on the specific row
    this._showRowLoading(transactionId);

    try {
      const result = await api.deleteTransaction(transactionId);

      if (result.success) {
        showNotification("Transaction deleted!", "success");

        // Optimistic UI update - remove the row immediately
        this._optimisticUpdateDelete(transactionId);

        // Reload data in background to ensure consistency
        this.loadData();
      } else {
        showNotification(`Error: ${result.error}`, "error");
        this._removeRowLoading(transactionId);
      }
    } catch (error) {
      showNotification(`Error: ${error.message}`, "error");
      this._removeRowLoading(transactionId);
    } finally {
      this.operationInProgress = false;
    }
  }

  _optimisticUpdateReturn(transactionId) {
    // Find and update the transaction in local data
    const transaction = this.data.find((t) => t.id === transactionId);
    if (transaction) {
      transaction.status = "returned";
      transaction.return_date = new Date().toISOString();
    }

    const filteredTransaction = this.filteredData.find(
      (t) => t.id === transactionId,
    );
    if (filteredTransaction) {
      filteredTransaction.status = "returned";
      filteredTransaction.return_date = new Date().toISOString();
    }

    // Update only the affected row
    const row = this.tableBody.querySelector(
      `tr[data-transaction-id="${transactionId}"]`,
    );
    if (row && filteredTransaction) {
      const newRow = this._createTransactionRow(filteredTransaction);
      row.replaceWith(newRow);
    }
  }

  _optimisticUpdateDelete(transactionId) {
    // Remove from local data
    this.data = this.data.filter((t) => t.id !== transactionId);
    this.filteredData = this.filteredData.filter((t) => t.id !== transactionId);

    // Remove row from DOM with animation
    const row = this.tableBody.querySelector(
      `tr[data-transaction-id="${transactionId}"]`,
    );
    if (row) {
      row.style.opacity = "0";
      row.style.transform = "translateX(-20px)";
      row.style.transition = "all 0.3s ease";

      setTimeout(() => {
        row.remove();

        // Check if table is empty
        if (this.filteredData.length === 0) {
          this.tableBody.innerHTML =
            '<tr><td colspan="8" style="text-align: center;">No transactions found</td></tr>';
        }
      }, 300);
    }
  }

  _showRowLoading(transactionId) {
    const row = this.tableBody.querySelector(
      `tr[data-transaction-id="${transactionId}"]`,
    );
    if (row) {
      row.style.opacity = "0.5";
      row.style.pointerEvents = "none";

      const actionsCell = row.querySelector("td:last-child");
      if (actionsCell) {
        actionsCell.innerHTML = `
          <div class="table-actions">
            <div class="spinner spinner-small"></div>
          </div>
        `;
      }
    }
  }

  _removeRowLoading(transactionId) {
    const row = this.tableBody.querySelector(
      `tr[data-transaction-id="${transactionId}"]`,
    );
    if (row) {
      row.style.opacity = "1";
      row.style.pointerEvents = "auto";
    }
  }

  async _updateStatisticsInBackground() {
    if (window.app) {
      // Update statistics without waiting
      window.app.loadStatistics().catch((err) => {
        console.error("Background stats update failed:", err);
      });

      // Update books data in background
      if (window.app.components.books) {
        window.app.components.books.loadData().catch((err) => {
          console.error("Background books update failed:", err);
        });
      }
    }
  }

  _escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
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
    this.isRendering = false;
  }
}

module.exports = Transactions;
