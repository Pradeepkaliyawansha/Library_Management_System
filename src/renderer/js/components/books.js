const api = require("../services/api");
const { showNotification } = require("../services/notifications");

class Books {
  constructor() {
    this.data = [];
    this.filteredData = [];
    this.editingBook = null;
    this.operationInProgress = false; // Only true during user-initiated saves/deletes
    this.searchTimeout = null;

    this.initElements();
    this.setupEventListeners();
  }

  initElements() {
    this.tableBody = document.getElementById("booksTableBody");
    this.searchInput = document.getElementById("bookSearch");
    this.formContainer = document.getElementById("addBookForm");
    this.formTitle = document.getElementById("bookFormTitle");
    this.form = this.formContainer.querySelector("form");
    this.issueModal = document.getElementById("issueBookModal");
    this.issueForm = document.getElementById("issueBookForm");
    this.issueModalTitle = document.getElementById("issueBookTitle");

    this.inputs = {
      isbn: document.getElementById("bookIsbn"),
      title: document.getElementById("bookTitle"),
      author: document.getElementById("bookAuthor"),
      publisher: document.getElementById("bookPublisher"),
      category: document.getElementById("bookCategory"),
      totalCopies: document.getElementById("bookTotalCopies"),
    };

    this.issueInputs = {
      isbn: document.getElementById("issueBookIsbn"),
      studentId: document.getElementById("issueStudentId"),
    };
  }

  setupEventListeners() {
    this.searchInput.addEventListener("input", () => this.handleSearch());

    window.showAddBookForm = () => this.showAddForm();
    window.hideAddBookForm = () => this.hideForm();
    window.addBook = (e) => this.handleSubmit(e);
    window.editBook = (isbn) => this.edit(isbn);
    window.deleteBook = (isbn) => this.delete(isbn);
    window.showIssueBookModal = (isbn) => this.showIssueModal(isbn);
    window.hideIssueBookModal = () => this.hideIssueModal();
    window.issueBook = (e) => this.handleIssue(e);
    window.exportBooksToExcel = () => this.exportToExcel();
    window.filterBooks = () => this.handleSearch();
  }

  // loadData never touches operationInProgress — it is called both by the user
  // and by background refreshes from the transactions component.
  async loadData() {
    try {
      this.data = await api.getBooks();
      this.filteredData = [...this.data];
      this.render();
    } catch (error) {
      console.error("Error loading books:", error);
      showNotification("Error loading books", "error");
    }
  }

  render() {
    if (this.filteredData.length === 0) {
      this.tableBody.innerHTML =
        '<tr><td colspan="8" style="text-align:center">No books found</td></tr>';
      return;
    }

    this.tableBody.innerHTML = "";

    this.filteredData.forEach((book) => {
      const row = document.createElement("tr");

      const cells = [
        book.isbn,
        book.title,
        book.author,
        book.publisher || "N/A",
        book.category || "N/A",
        book.total_copies,
        book.available_copies,
      ];

      cells.forEach((val, i) => {
        const td = document.createElement("td");
        td.textContent = val;
        row.appendChild(td);
      });

      // Actions cell
      const actionsCell = document.createElement("td");
      const actionsDiv = document.createElement("div");
      actionsDiv.className = "table-actions";

      const issueBtn = document.createElement("button");
      issueBtn.className = "btn-small btn-success";
      issueBtn.textContent = "Issue";
      issueBtn.disabled = book.available_copies <= 0;
      issueBtn.onclick = () => this.showIssueModal(book.isbn);

      const editBtn = document.createElement("button");
      editBtn.className = "btn-small btn-primary";
      editBtn.textContent = "Edit";
      editBtn.onclick = () => this.edit(book.isbn);

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "btn-small btn-danger";
      deleteBtn.textContent = "Delete";
      deleteBtn.onclick = () => this.delete(book.isbn);

      actionsDiv.append(issueBtn, editBtn, deleteBtn);
      actionsCell.appendChild(actionsDiv);
      row.appendChild(actionsCell);

      this.tableBody.appendChild(row);
    });
  }

  handleSearch() {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      const term = this.searchInput.value.toLowerCase();
      this.filteredData = this.data.filter(
        (b) =>
          b.isbn.toLowerCase().includes(term) ||
          b.title.toLowerCase().includes(term) ||
          b.author.toLowerCase().includes(term) ||
          (b.category && b.category.toLowerCase().includes(term)),
      );
      this.render();
    }, 150);
  }

  showAddForm() {
    this.editingBook = null;
    this.formContainer.style.display = "block";
    this.formTitle.textContent = "Add New Book";
    this.inputs.isbn.disabled = false;
    this.inputs.isbn.readOnly = false;
    this.form.reset();
    this.formContainer.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  hideForm() {
    this.formContainer.style.display = "none";
    this.form.reset();
    this.editingBook = null;
    this.inputs.isbn.disabled = false;
    this.inputs.isbn.readOnly = false;
  }

  edit(isbn) {
    const book = this.data.find((b) => b.isbn === isbn);
    if (!book) return;

    this.editingBook = book;
    this.formTitle.textContent = "Edit Book";
    this.inputs.isbn.value = book.isbn;
    this.inputs.isbn.disabled = true;
    this.inputs.isbn.readOnly = true;
    this.inputs.title.value = book.title;
    this.inputs.author.value = book.author;
    this.inputs.publisher.value = book.publisher || "";
    this.inputs.category.value = book.category || "";
    this.inputs.totalCopies.value = book.total_copies;

    this.formContainer.style.display = "block";
    this.formContainer.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async handleSubmit(event) {
    event.preventDefault();

    // Guard only the save action — not data loading
    if (this.operationInProgress) {
      showNotification("Please wait…", "warning");
      return;
    }
    this.operationInProgress = true;

    const totalCopies = parseInt(this.inputs.totalCopies.value);
    const isEdit = !!this.editingBook;

    const book = {
      isbn: this.inputs.isbn.value.trim(),
      title: this.inputs.title.value.trim(),
      author: this.inputs.author.value.trim(),
      publisher: this.inputs.publisher.value.trim(),
      category: this.inputs.category.value.trim(),
      total_copies: totalCopies,
      available_copies: isEdit
        ? this.editingBook.available_copies +
          (totalCopies - this.editingBook.total_copies)
        : totalCopies,
    };

    this.hideForm(); // Hide immediately so user isn't blocked

    try {
      const result = isEdit
        ? await api.updateBook(book)
        : await api.addBook(book);

      if (result.success) {
        showNotification(isEdit ? "Book updated!" : "Book added!", "success");
        await this.loadData();
        this._syncDashboard();
        window.app?.loadStatistics();
      } else {
        showNotification(`Error: ${result.error}`, "error");
        isEdit ? this.edit(book.isbn) : this.showAddForm();
      }
    } catch (error) {
      showNotification(`Error: ${error.message}`, "error");
    } finally {
      // Always release — no matter what happened above
      this.operationInProgress = false;
    }
  }

  async delete(isbn) {
    if (this.operationInProgress) {
      showNotification("Please wait…", "warning");
      return;
    }
    if (!confirm("Are you sure you want to delete this book?")) return;

    this.operationInProgress = true;
    try {
      const result = await api.deleteBook(isbn);
      if (result.success) {
        showNotification("Book deleted!", "success");
        await this.loadData();
        this._syncDashboard();
        window.app?.loadStatistics();
      } else {
        showNotification(`Error: ${result.error}`, "error");
      }
    } catch (error) {
      showNotification(`Error: ${error.message}`, "error");
    } finally {
      this.operationInProgress = false;
    }
  }

  showIssueModal(isbn) {
    const book = this.data.find((b) => b.isbn === isbn);
    if (!book) return;

    this.issueInputs.isbn.value = isbn;
    this.issueModalTitle.textContent = `Issue: ${book.title}`;
    this.issueModal.style.display = "block";

    setTimeout(() => {
      this.issueInputs.studentId.value = "";
      this.issueInputs.studentId.focus();
    }, 100);
  }

  hideIssueModal() {
    this.issueModal.style.display = "none";
    this.issueForm.reset();
  }

  async handleIssue(event) {
    event.preventDefault();

    if (this.operationInProgress) {
      showNotification("Please wait…", "warning");
      return;
    }
    this.operationInProgress = true;

    const transaction = {
      student_id: this.issueInputs.studentId.value.trim(),
      isbn: this.issueInputs.isbn.value.trim(),
    };

    this.hideIssueModal();

    try {
      const result = await api.issueBook(transaction);
      if (result.success) {
        showNotification("Book issued successfully!", "success");
        await this.loadData();
        window.app?.components.transactions.loadData();
        window.app?.loadStatistics();
        this._syncDashboard();
      } else {
        showNotification(`Error: ${result.error}`, "error");
      }
    } catch (error) {
      showNotification(`Error: ${error.message}`, "error");
    } finally {
      this.operationInProgress = false;
    }
  }

  _syncDashboard() {
    if (window.app?.components.dashboard) {
      window.app.components.dashboard.update(
        window.app.components.students.data,
        this.data,
      );
    }
  }

  async exportToExcel() {
    if (this.data.length === 0) {
      showNotification("No books to export!", "warning");
      return;
    }
    try {
      const result = await api.exportToExcel("Books", this.data);
      if (result.success) {
        showNotification("Books exported successfully!", "success");
      } else if (result.error !== "Export cancelled") {
        showNotification(`Export failed: ${result.error}`, "error");
      }
    } catch (error) {
      showNotification(`Export error: ${error.message}`, "error");
    }
  }

  destroy() {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
  }
}

module.exports = Books;
