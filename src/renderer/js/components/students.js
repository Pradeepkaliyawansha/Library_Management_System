const api = require("../services/api");
const { showNotification } = require("../services/notifications");

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
    if (!confirm("Are you sure you want to delete this student?")) return;

    this.operationInProgress = true;
    try {
      const result = await api.deleteStudent(studentId);
      if (result.success) {
        showNotification("Student deleted!", "success");
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

  async viewBooks(studentId) {
    try {
      const books = await api.getStudentBooks(studentId);
      const student = this.data.find((s) => s.student_id === studentId);

      let message = `Books borrowed by ${student.name} (${studentId}):\n\n`;

      if (books.length === 0) {
        message += "No books currently borrowed.";
      } else {
        books.forEach((book, i) => {
          message += `${i + 1}. ${book.title} by ${book.author}\n`;
          message += `   ISBN: ${book.isbn}\n`;
          message += `   Issued:  ${new Date(book.issue_date).toLocaleDateString()}\n`;
          message += `   Due:     ${new Date(book.due_date).toLocaleDateString()}\n\n`;
        });
      }

      alert(message);
    } catch (error) {
      showNotification("Error loading student books", "error");
    }
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
