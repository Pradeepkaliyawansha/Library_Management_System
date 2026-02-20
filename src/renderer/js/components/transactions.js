const api = require("../services/api");
const { showNotification } = require("../services/notifications");

class Transactions {
  constructor() {
    this.data = [];
    this.filteredData = [];
    this.searchTimeout = null;
    this.isRendering = false;

    // Per-row locks instead of a single global flag.
    // This means: acting on row #5 never blocks row #7 or any other tab's form.
    this.pendingRows = new Set();

    this.initElements();
    this.setupEventListeners();
  }

  initElements() {
    this.tableBody = document.getElementById("transactionsTableBody");
    this.searchInput = document.getElementById("transactionSearch");
  }

  setupEventListeners() {
    this.searchInput.addEventListener("input", () => this.handleSearch());

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
    if (this.isRendering) return;
    this.isRendering = true;
    requestAnimationFrame(() => {
      this._performRender();
      this.isRendering = false;
    });
  }

  _performRender() {
    if (this.filteredData.length === 0) {
      this.tableBody.innerHTML =
        '<tr><td colspan="8" style="text-align:center">No transactions found</td></tr>';
      return;
    }

    const fragment = document.createDocumentFragment();
    this.filteredData.forEach((t) =>
      fragment.appendChild(this._createTransactionRow(t)),
    );

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
    if (isOverdue) row.className = "overdue-row";
    row.dataset.transactionId = t.id;

    row.innerHTML = `
      <td>${this._escapeHtml(t.student_id)}</td>
      <td>${this._escapeHtml(t.student_name || "N/A")}</td>
      <td style="font-family:monospace">${this._escapeHtml(t.isbn || "N/A")}</td>
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

    this._attachEventListeners(row, t);
    return row;
  }

  _getStatusBadgeHtml(status) {
    return `<span class="status-badge status-${status}">${status.toUpperCase()}</span>`;
  }

  _getActionButtonsHtml(t) {
    if (t.status === "issued") {
      return `<button class="btn-small btn-warning return-btn" data-id="${t.id}">Return</button>`;
    }
    if (t.status === "returned") {
      return `<button class="btn-small btn-danger delete-btn" data-id="${t.id}">Delete</button>`;
    }
    return "";
  }

  _attachEventListeners(row, t) {
    const returnBtn = row.querySelector(".return-btn");
    const deleteBtn = row.querySelector(".delete-btn");

    if (returnBtn) {
      returnBtn.onclick = (e) => {
        e.stopPropagation();
        this.returnBook(t.id);
      };
    }
    if (deleteBtn) {
      deleteBtn.onclick = (e) => {
        e.stopPropagation();
        this.deleteTransaction(t.id);
      };
    }
  }

  handleSearch() {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);

    this.searchTimeout = setTimeout(() => {
      const term = this.searchInput.value.toLowerCase();
      this.filteredData = term
        ? this.data.filter(
            (t) =>
              t.student_id.toLowerCase().includes(term) ||
              (t.student_name && t.student_name.toLowerCase().includes(term)) ||
              (t.book_title && t.book_title.toLowerCase().includes(term)) ||
              (t.isbn && t.isbn.toLowerCase().includes(term)),
          )
        : [...this.data];
      this.render();
    }, 150);
  }

  // ─── Return ────────────────────────────────────────────────────────────────

  async returnBook(transactionId) {
    // Per-row guard — does NOT block any other component or form
    if (this.pendingRows.has(transactionId)) {
      showNotification("Already processing this row…", "warning");
      return;
    }
    if (!confirm("Mark this book as returned?")) return;

    this.pendingRows.add(transactionId);
    this._showRowLoading(transactionId);

    try {
      const result = await api.returnBook(transactionId);

      if (result.success) {
        showNotification("Book returned successfully!", "success");
        this._optimisticUpdateReturn(transactionId);

        // Fire-and-forget background refreshes — wrapped in their own
        // try/catch so a failure here NEVER affects this component's state
        this._backgroundRefresh();
      } else {
        showNotification(`Error: ${result.error}`, "error");
        this._removeRowLoading(transactionId);
      }
    } catch (error) {
      showNotification(`Error: ${error.message}`, "error");
      this._removeRowLoading(transactionId);
    } finally {
      // Always release the row lock
      this.pendingRows.delete(transactionId);
    }
  }

  // ─── Delete ────────────────────────────────────────────────────────────────

  async deleteTransaction(transactionId) {
    if (this.pendingRows.has(transactionId)) {
      showNotification("Already processing this row…", "warning");
      return;
    }
    if (!confirm("Delete this transaction record?")) return;

    this.pendingRows.add(transactionId);
    this._showRowLoading(transactionId);

    try {
      const result = await api.deleteTransaction(transactionId);

      if (result.success) {
        showNotification("Transaction deleted!", "success");
        this._optimisticUpdateDelete(transactionId);
        this._backgroundRefresh();
      } else {
        showNotification(`Error: ${result.error}`, "error");
        this._removeRowLoading(transactionId);
      }
    } catch (error) {
      showNotification(`Error: ${error.message}`, "error");
      this._removeRowLoading(transactionId);
    } finally {
      this.pendingRows.delete(transactionId);
    }
  }

  // ─── Optimistic UI ─────────────────────────────────────────────────────────

  _optimisticUpdateReturn(transactionId) {
    // Update local data arrays first
    [this.data, this.filteredData].forEach((arr) => {
      const t = arr.find((x) => x.id === transactionId);
      if (t) {
        t.status = "returned";
        t.return_date = new Date().toISOString();
      }
    });

    // Swap just the one DOM row — no full re-render
    const row = this.tableBody.querySelector(
      `tr[data-transaction-id="${transactionId}"]`,
    );
    const updated = this.filteredData.find((x) => x.id === transactionId);
    if (row && updated) row.replaceWith(this._createTransactionRow(updated));
  }

  _optimisticUpdateDelete(transactionId) {
    this.data = this.data.filter((x) => x.id !== transactionId);
    this.filteredData = this.filteredData.filter((x) => x.id !== transactionId);

    const row = this.tableBody.querySelector(
      `tr[data-transaction-id="${transactionId}"]`,
    );
    if (row) {
      row.style.cssText =
        "opacity:0;transform:translateX(-20px);transition:all .25s ease";
      setTimeout(() => {
        row.remove();
        if (this.filteredData.length === 0) {
          this.tableBody.innerHTML =
            '<tr><td colspan="8" style="text-align:center">No transactions found</td></tr>';
        }
      }, 260);
    }
  }

  // ─── Background refresh ────────────────────────────────────────────────────
  // IMPORTANT: this method NEVER sets operationInProgress on other components.
  // It calls the raw api directly and updates caches, then lets each
  // component re-render itself at its own pace.

  _backgroundRefresh() {
    // Statistics header
    if (window.app) {
      window.app
        .loadStatistics()
        .catch((e) => console.error("Background stats refresh failed:", e));
    }

    // Reload our own full data quietly in background (for consistency)
    // Use a short delay so the optimistic update renders first
    setTimeout(() => {
      this.loadData().catch((e) =>
        console.error("Background transaction reload failed:", e),
      );
    }, 800);

    // Books available-copies counter — reload silently WITHOUT touching
    // books.operationInProgress so the Books form stays fully interactive
    if (window.app && window.app.components.books) {
      setTimeout(() => {
        api
          .getBooks()
          .then((books) => {
            window.app.components.books.data = books;
            // Only re-render books table if the books tab is currently visible
            const booksTabActive = document
              .getElementById("books")
              ?.classList.contains("active");
            if (booksTabActive) {
              window.app.components.books.filteredData = [...books];
              window.app.components.books.render();
            }
          })
          .catch((e) => console.error("Background books refresh failed:", e));
      }, 400);
    }
  }

  // ─── Row loading state ─────────────────────────────────────────────────────

  _showRowLoading(transactionId) {
    const row = this.tableBody.querySelector(
      `tr[data-transaction-id="${transactionId}"]`,
    );
    if (!row) return;
    row.style.opacity = "0.45";
    row.style.pointerEvents = "none";
    const actionsCell = row.querySelector("td:last-child");
    if (actionsCell) {
      actionsCell.innerHTML = `
        <div class="table-actions">
          <div class="spinner spinner-small"></div>
        </div>`;
    }
  }

  _removeRowLoading(transactionId) {
    // Re-render just that one row from local data to restore its buttons
    const t = this.filteredData.find((x) => x.id === transactionId);
    const row = this.tableBody.querySelector(
      `tr[data-transaction-id="${transactionId}"]`,
    );
    if (row && t) {
      row.replaceWith(this._createTransactionRow(t));
    }
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

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
    return {
      total: this.data.length,
      issued: this.data.filter((t) => t.status === "issued").length,
      returned: this.data.filter((t) => t.status === "returned").length,
      overdue: this.getOverdueTransactions().length,
    };
  }

  destroy() {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.isRendering = false;
    this.pendingRows.clear();
  }
}

module.exports = Transactions;
