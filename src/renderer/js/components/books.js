const api = require("../services/api");
const { showNotification } = require("../services/notifications");

class Books {
  constructor() {
    this.data = [];
    this.filteredData = [];
    this.editingBook = null;
    this.operationInProgress = false;
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

    // Modal elements
    this.issueModal = document.getElementById("issueBookModal");
    this.issueForm = document.getElementById("issueBookForm");
    this.issueModalTitle = document.getElementById("issueBookTitle");

    // Form inputs
    this.inputs = {
      isbn: document.getElementById("bookIsbn"),
      title: document.getElementById("bookTitle"),
      author: document.getElementById("bookAuthor"),
      publisher: document.getElementById("bookPublisher"),
      category: document.getElementById("bookCategory"),
      totalCopies: document.getElementById("bookTotalCopies"),
    };

    // Issue form inputs
    this.issueInputs = {
      isbn: document.getElementById("issueBookIsbn"),
      studentId: document.getElementById("issueStudentId"),
    };
  }

  setupEventListeners() {
    // Search with debouncing
    this.searchInput.addEventListener("input", () => this.handleSearch());

    // Make functions globally available
    window.showAddBookForm = () => this.showAddForm();
    window.hideAddBookForm = () => this.hideForm();
    window.addBook = (e) => this.handleSubmit(e);
    window.editBook = (isbn) => this.edit(isbn);
    window.deleteBook = (isbn) => this.delete(isbn);
    window.showIssueBookModal = (isbn) => this.showIssueModal(isbn);
    window.hideIssueBookModal = () => this.hideIssueModal();
    window.issueBook = (e) => this.handleIssue(e);
    window.exportBooksToExcel = () => this.exportToExcel();
    window.filterBooks = () => this.handleSearch(); // FIXED: Added global filter function
  }

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
        '<tr><td colspan="8" style="text-align: center;">No books found</td></tr>';
      return;
    }

    // FIXED: Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();
    const tempDiv = document.createElement("div");

    tempDiv.innerHTML = this.filteredData
      .map(
        (book) => `
        <tr>
          <td>${book.isbn}</td>
          <td>${book.title}</td>
          <td>${book.author}</td>
          <td>${book.publisher || "N/A"}</td>
          <td>${book.category || "N/A"}</td>
          <td>${book.total_copies}</td>
          <td>${book.available_copies}</td>
          <td>
            <div class="table-actions">
              <button class="btn-small btn-success" onclick="showIssueBookModal('${book.isbn}')" ${book.available_copies <= 0 ? "disabled" : ""}>Issue</button>
              <button class="btn-small btn-primary" onclick="editBook('${book.isbn}')">Edit</button>
              <button class="btn-small btn-danger" onclick="deleteBook('${book.isbn}')">Delete</button>
            </div>
          </td>
        </tr>
      `,
      )
      .join("");

    // Move all tr elements to fragment
    while (tempDiv.firstChild) {
      fragment.appendChild(tempDiv.firstChild);
    }

    // Clear and update in one operation
    this.tableBody.innerHTML = "";
    this.tableBody.appendChild(fragment);
  }

  handleSearch() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      const searchTerm = this.searchInput.value.toLowerCase();
      this.filteredData = this.data.filter(
        (b) =>
          b.isbn.toLowerCase().includes(searchTerm) ||
          b.title.toLowerCase().includes(searchTerm) ||
          b.author.toLowerCase().includes(searchTerm) ||
          (b.category && b.category.toLowerCase().includes(searchTerm)),
      );
      this.render();
    }, 150);
  }

  showAddForm() {
    this.editingBook = null;
    this.formContainer.style.display = "block";
    this.formTitle.textContent = "Add New Book";
    this.inputs.isbn.disabled = false;
    this.inputs.isbn.readOnly = false; // FIXED: Added readOnly reset
    this.form.reset();
    this.formContainer.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  hideForm() {
    this.formContainer.style.display = "none";
    this.form.reset();
    this.editingBook = null;
    // FIXED: Reset disabled state
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
    this.inputs.isbn.readOnly = true; // FIXED: Added readOnly for better form handling
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

    if (this.operationInProgress) {
      showNotification("Please wait...", "warning");
      return;
    }

    this.operationInProgress = true;

    const totalCopies = parseInt(this.inputs.totalCopies.value);

    const book = {
      isbn: this.inputs.isbn.value.trim(),
      title: this.inputs.title.value.trim(),
      author: this.inputs.author.value.trim(),
      publisher: this.inputs.publisher.value.trim(),
      category: this.inputs.category.value.trim(),
      total_copies: totalCopies,
      available_copies: this.editingBook
        ? this.editingBook.available_copies +
          (totalCopies - this.editingBook.total_copies)
        : totalCopies,
    };

    const isEdit = !!this.editingBook;
    this.hideForm();

    try {
      let result;
      if (isEdit) {
        result = await api.updateBook(book);
      } else {
        result = await api.addBook(book);
      }

      if (result.success) {
        showNotification(isEdit ? "Book updated!" : "Book added!", "success");
        await this.loadData();

        // Refresh app statistics and dashboard
        if (window.app) {
          await window.app.loadStatistics();
          window.app.components.dashboard.update(
            window.app.components.students.data,
            this.data,
          );
        }
      } else {
        showNotification(`Error: ${result.error}`, "error");
        if (isEdit) {
          this.edit(book.isbn);
        } else {
          this.showAddForm();
        }
      }
    } catch (error) {
      showNotification(`Error: ${error.message}`, "error");
    } finally {
      this.operationInProgress = false;
    }
  }

  async delete(isbn) {
    if (this.operationInProgress) {
      showNotification("Please wait...", "warning");
      return;
    }

    if (confirm("Are you sure you want to delete this book?")) {
      this.operationInProgress = true;

      try {
        const result = await api.deleteBook(isbn);

        if (result.success) {
          showNotification("Book deleted!", "success");
          await this.loadData();

          if (window.app) {
            await window.app.loadStatistics();
            window.app.components.dashboard.update(
              window.app.components.students.data,
              this.data,
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

  showIssueModal(isbn) {
    const book = this.data.find((b) => b.isbn === isbn);
    if (!book) return;

    this.issueInputs.isbn.value = isbn;
    this.issueModalTitle.textContent = `Issue: ${book.title}`;
    this.issueModal.style.display = "block";

    // FIXED: Add small delay to ensure modal is visible before focus
    setTimeout(() => {
      this.issueInputs.studentId.value = ""; // Clear previous value
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
      showNotification("Please wait...", "warning");
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

        // Reload books, transactions, and statistics
        await this.loadData();

        if (window.app) {
          await window.app.components.transactions.loadData();
          await window.app.loadStatistics();
          window.app.components.dashboard.update(
            window.app.components.students.data,
            this.data,
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

  // FIXED: Added cleanup method
  destroy() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = null;
    }
  }
}

module.exports = Books;
