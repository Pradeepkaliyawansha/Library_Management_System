const api = require("../services/api");
const { showNotification } = require("../services/notifications");
const { showConfirm } = require("../utils/confirm");
class Students {
  constructor() {
    this.data = [];
    this.filteredData = [];
    this.editingStudent = null;
    this.operationInProgress = false; // Only true during saves/deletes, never during loadData
    this.searchTimeout = null;

    this.initElements();
    this.setupEventListeners();
  }

  initElements() {
    this.tableBody = document.getElementById("studentsTableBody");
    this.searchInput = document.getElementById("studentSearch");
    this.formContainer = document.getElementById("addStudentForm");
    this.formTitle = document.getElementById("studentFormTitle");
    this.form = this.formContainer.querySelector("form");

    this.inputs = {
      studentId: document.getElementById("studentId"),
      name: document.getElementById("studentName"),
      email: document.getElementById("studentEmail"),
      phone: document.getElementById("studentPhone"),
      department: document.getElementById("studentDepartment"),
      year: document.getElementById("studentYear"),
    };
  }

  setupEventListeners() {
    this.searchInput.addEventListener("input", () => this.handleSearch());

    window.showAddStudentForm = () => this.showAddForm();
    window.hideAddStudentForm = () => this.hideForm();
    window.addStudent = (e) => this.handleSubmit(e);
    window.editStudent = (id) => this.edit(id);
    window.deleteStudent = (id) => this.delete(id);
    window.viewStudentBooks = (id) => this.viewBooks(id);
    window.exportStudentsToExcel = () => this.exportToExcel();
    window.filterStudents = () => this.handleSearch();
  }

  // loadData is called freely by background refreshes — no flag needed here
  async loadData() {
    try {
      this.data = await api.getStudents();
      this.filteredData = [...this.data];
      this.render();
    } catch (error) {
      console.error("Error loading students:", error);
      showNotification("Error loading students", "error");
    }
  }

  render() {
    if (this.filteredData.length === 0) {
      this.tableBody.innerHTML =
        '<tr><td colspan="7" style="text-align:center">No students found</td></tr>';
      return;
    }

    this.tableBody.innerHTML = "";

    this.filteredData.forEach((student) => {
      const row = document.createElement("tr");

      [
        student.student_id,
        student.name,
        student.email,
        student.phone || "N/A",
        student.department || "N/A",
        student.year || "N/A",
      ].forEach((val) => {
        const td = document.createElement("td");
        td.textContent = val;
        row.appendChild(td);
      });

      const actionsCell = document.createElement("td");
      const actionsDiv = document.createElement("div");
      actionsDiv.className = "table-actions";

      const booksBtn = document.createElement("button");
      booksBtn.className = "btn-small btn-info";
      booksBtn.textContent = "Books";
      booksBtn.onclick = () => this.viewBooks(student.student_id);

      const editBtn = document.createElement("button");
      editBtn.className = "btn-small btn-primary";
      editBtn.textContent = "Edit";
      editBtn.onclick = () => this.edit(student.student_id);

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "btn-small btn-danger";
      deleteBtn.textContent = "Delete";
      deleteBtn.onclick = () => this.delete(student.student_id);

      actionsDiv.append(booksBtn, editBtn, deleteBtn);
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
        (s) =>
          s.student_id.toLowerCase().includes(term) ||
          s.name.toLowerCase().includes(term) ||
          s.email.toLowerCase().includes(term) ||
          (s.department && s.department.toLowerCase().includes(term)),
      );
      this.render();
    }, 150);
  }

  showAddForm() {
    this.editingStudent = null;
    this.formContainer.style.display = "block";
    this.formTitle.textContent = "Add New Student";
    this.inputs.studentId.disabled = false;
    this.inputs.studentId.readOnly = false;
    this.form.reset();
    this.formContainer.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  hideForm() {
    this.formContainer.style.display = "none";
    this.form.reset();
    this.editingStudent = null;
    this.inputs.studentId.disabled = false;
    this.inputs.studentId.readOnly = false;
  }

  edit(studentId) {
    const student = this.data.find((s) => s.student_id === studentId);
    if (!student) return;

    this.editingStudent = student;
    this.formTitle.textContent = "Edit Student";
    this.inputs.studentId.value = student.student_id;
    this.inputs.studentId.disabled = true;
    this.inputs.studentId.readOnly = true;
    this.inputs.name.value = student.name;
    this.inputs.email.value = student.email;
    this.inputs.phone.value = student.phone || "";
    this.inputs.department.value = student.department || "";
    this.inputs.year.value = student.year || "";

    this.formContainer.style.display = "block";
    this.formContainer.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async handleSubmit(event) {
    event.preventDefault();

    if (this.operationInProgress) {
      showNotification("Please wait…", "warning");
      return;
    }
    this.operationInProgress = true;

    const isEdit = !!this.editingStudent;

    const student = {
      student_id: this.inputs.studentId.value.trim(),
      name: this.inputs.name.value.trim(),
      email: this.inputs.email.value.trim(),
      phone: this.inputs.phone.value.trim(),
      department: this.inputs.department.value.trim(),
      year: this.inputs.year.value,
    };

    this.hideForm(); // Hide form immediately — user can keep working

    try {
      const result = isEdit
        ? await api.updateStudent(student)
        : await api.addStudent(student);

      if (result.success) {
        showNotification(
          isEdit ? "Student updated!" : "Student added!",
          "success",
        );
        await this.loadData();
        this._syncDashboard();
        window.app?.loadStatistics();
      } else {
        showNotification(`Error: ${result.error}`, "error");
        isEdit ? this.edit(student.student_id) : this.showAddForm();
      }
    } catch (error) {
      showNotification(`Error: ${error.message}`, "error");
    } finally {
      // Always released — even if loadData or syncDashboard throws
      this.operationInProgress = false;
    }
  }

  async delete(studentId) {
    if (this.operationInProgress) {
      showNotification("Please wait…", "warning");
      return;
    }

    // Pre-check: show active loans in the confirm dialog before asking
    try {
      const activeLoans = await api.getStudentBooks(studentId);
      if (activeLoans.length > 0) {
        const student = this.data.find((s) => s.student_id === studentId);
        const name = student ? student.name : studentId;
        showNotification(
          `❌ Cannot delete "${name}" — they have ${activeLoans.length} unreturned book(s). Return all books first.`,
          "error",
        );
        return; // Stop here — no confirm dialog, no API call
      }
    } catch (error) {
      // If the pre-check fails, fall through and let the backend decide
      console.warn("Pre-check for active loans failed:", error);
    }

    const ok = await showConfirm(
      "Are you sure you want to delete this student? This cannot be undone.",
      { icon: "🗑️", confirm: "Delete", variant: "danger" },
    );
    if (!ok) return;

    this.operationInProgress = true;
    try {
      const result = await api.deleteStudent(studentId);
      if (result.success) {
        showNotification("Student deleted!", "success");
        await this.loadData();
        this._syncDashboard();
        window.app?.loadStatistics();
      } else {
        // Backend blocked it (safety net — catches race conditions)
        showNotification(`❌ ${result.error}`, "error");
      }
    } catch (error) {
      showNotification(`Error: ${error.message}`, "error");
    } finally {
      this.operationInProgress = false;
    }
  }

  async viewBooks(studentId) {
    try {
      const books = await api.getStudentBooks(studentId);
      const student = this.data.find((s) => s.student_id === studentId);
      this._showStudentBooksModal(student, books);
    } catch (error) {
      showNotification("Error loading student books", "error");
    }
  }

  _showStudentBooksModal(student, books) {
    // Remove existing modal if any
    const existing = document.getElementById("studentBooksModal");
    if (existing) existing.remove();

    const isOverdue = (dueDate) => dueDate && new Date(dueDate) < new Date();

    const booksHtml =
      books.length === 0
        ? `<div style="text-align:center; padding: var(--space-10); color: var(--color-text-muted);">
             <div style="font-size: 3rem; margin-bottom: var(--space-4);">📭</div>
             <p style="font-size: var(--font-size-base);">No books currently borrowed.</p>
           </div>`
        : books
            .map((book, i) => {
              const overdue = isOverdue(book.due_date);
              return `
              <div style="
                background: var(--color-bg-tertiary);
                border: 1px solid var(--color-border);
                border-left: 4px solid ${overdue ? "var(--color-danger)" : "var(--color-primary)"};
                border-radius: var(--radius-md);
                padding: var(--space-4) var(--space-5);
                margin-bottom: var(--space-3);
              ">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; gap: var(--space-3);">
                  <div style="flex:1; min-width:0;">
                    <div style="font-weight: var(--font-weight-bold); color: var(--color-text); font-size: var(--font-size-base); margin-bottom: var(--space-1);">
                      ${i + 1}. ${this._escapeHtml(book.title)}
                    </div>
                    <div style="color: var(--color-text-secondary); font-size: var(--font-size-sm);">
                      by ${this._escapeHtml(book.author || "Unknown")}
                    </div>
                    <div style="color: var(--color-text-muted); font-size: var(--font-size-xs); margin-top: var(--space-1); font-family: monospace;">
                      Book No: ${this._escapeHtml(book.isbn)}
                    </div>
                  </div>
                  <span class="status-badge ${overdue ? "status-overdue" : "status-issued"}" style="flex-shrink:0;">
                    ${overdue ? "OVERDUE" : "ISSUED"}
                  </span>
                </div>
                <div style="display:flex; gap: var(--space-6); margin-top: var(--space-3); font-size: var(--font-size-xs); color: var(--color-text-secondary);">
                  <span>📅 Issued: ${new Date(book.issue_date).toLocaleDateString()}</span>
                  <span style="color: ${overdue ? "var(--color-danger)" : "inherit"};">
                    ⏰ Due: ${new Date(book.due_date).toLocaleDateString()}
                  </span>
                </div>
              </div>`;
            })
            .join("");

    const overdueCount = books.filter((b) => isOverdue(b.due_date)).length;

    const modal = document.createElement("div");
    modal.id = "studentBooksModal";
    modal.className = "modal";
    modal.style.cssText = "display:flex;";
    modal.innerHTML = `
      <div class="modal-backdrop" id="studentBooksBackdrop"></div>
      <div class="modal-content" style="max-width: 560px; width: 95%; padding: var(--space-8);">

        <div class="modal-header">
          <h3 class="modal-title" style="margin:0; display:flex; align-items:center; gap:var(--space-3); font-family:var(--font-display);">
            📚 Borrowed Books
          </h3>
          <button class="modal-close" id="studentBooksCloseBtn" aria-label="Close">✕</button>
        </div>

        <!-- Student info card -->
        <div style="
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: var(--space-4) var(--space-5);
          margin: var(--space-5) 0;
          display: flex;
          align-items: center;
          gap: var(--space-4);
        ">
          <div style="
            width: 48px; height: 48px;
            background: var(--gradient-primary);
            border-radius: var(--radius-full);
            display: flex; align-items: center; justify-content: center;
            font-size: 1.5rem; flex-shrink: 0;
          ">👤</div>
          <div style="flex:1; min-width:0;">
            <div style="font-weight: var(--font-weight-bold); color: var(--color-text); font-size: var(--font-size-base);">
              ${this._escapeHtml(student?.name || "Unknown")}
            </div>
            <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-top: 2px;">
              ID: ${this._escapeHtml(student?.student_id || "")}${student?.department ? ` &bull; ${this._escapeHtml(student.department)}` : ""}${student?.year ? ` &bull; ${this._escapeHtml(student.year)}` : ""}
            </div>
          </div>
          <div style="text-align:right; flex-shrink:0;">
            <div style="font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); color: var(--color-primary); line-height:1;">
              ${books.length}
            </div>
            <div style="font-size: var(--font-size-xs); color: var(--color-text-muted); text-transform:uppercase; letter-spacing:.05em;">
              Book${books.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        ${
          overdueCount > 0
            ? `
        <div style="
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.3);
          border-radius: var(--radius-md);
          padding: var(--space-3) var(--space-4);
          margin-bottom: var(--space-4);
          color: var(--color-danger);
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
          display: flex;
          align-items: center;
          gap: var(--space-2);
        ">
          ⚠️ ${overdueCount} book${overdueCount !== 1 ? "s are" : " is"} overdue and need${overdueCount === 1 ? "s" : ""} to be returned.
        </div>`
            : ""
        }

        <!-- Books list -->
        <div style="max-height: 380px; overflow-y: auto; padding-right: var(--space-1);">
          ${booksHtml}
        </div>

        <div class="modal-footer" style="border-top: 1px solid var(--color-border); padding-top: var(--space-5); margin-top: var(--space-4); justify-content:flex-end;">
          <button class="btn btn-secondary" id="studentBooksOkBtn">Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    document.body.classList.add("modal-open");

    const close = () => {
      modal.remove();
      document.body.classList.remove("modal-open");
    };

    document
      .getElementById("studentBooksCloseBtn")
      .addEventListener("click", close);
    document
      .getElementById("studentBooksOkBtn")
      .addEventListener("click", close);
    document
      .getElementById("studentBooksBackdrop")
      .addEventListener("click", close);

    document.addEventListener("keydown", function onKey(e) {
      if (e.key === "Escape") {
        document.removeEventListener("keydown", onKey);
        close();
      }
    });
  }

  _escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  _syncDashboard() {
    if (window.app?.components.dashboard) {
      window.app.components.dashboard.update(
        this.data,
        window.app.components.books.data,
      );
    }
  }

  async exportToExcel() {
    if (this.data.length === 0) {
      showNotification("No students to export!", "warning");
      return;
    }
    try {
      const result = await api.exportToExcel("Students", this.data);
      if (result.success) {
        showNotification("Students exported successfully!", "success");
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

module.exports = Students;
