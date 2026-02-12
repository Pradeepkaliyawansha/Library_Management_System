const api = require("../services/api");
const { showNotification } = require("../services/notifications");

class Students {
  constructor() {
    this.data = [];
    this.filteredData = [];
    this.editingStudent = null;
    this.operationInProgress = false;
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

    // Form inputs
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
    // Search with debouncing
    this.searchInput.addEventListener("input", () => this.handleSearch());

    // Make functions globally available
    window.showAddStudentForm = () => this.showAddForm();
    window.hideAddStudentForm = () => this.hideForm();
    window.addStudent = (e) => this.handleSubmit(e);
    window.editStudent = (id) => this.edit(id);
    window.deleteStudent = (id) => this.delete(id);
    window.viewStudentBooks = (id) => this.viewBooks(id);
    window.exportStudentsToExcel = () => this.exportToExcel();
    window.filterStudents = () => this.handleSearch();
  }

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
        '<tr><td colspan="7" style="text-align: center;">No students found</td></tr>';
      return;
    }

    // Clear the table body first
    this.tableBody.innerHTML = "";

    // Create rows directly using DOM methods to ensure proper column structure
    this.filteredData.forEach((student) => {
      const row = document.createElement("tr");

      // Student ID cell
      const idCell = document.createElement("td");
      idCell.textContent = student.student_id;
      row.appendChild(idCell);

      // Name cell
      const nameCell = document.createElement("td");
      nameCell.textContent = student.name;
      row.appendChild(nameCell);

      // Email cell
      const emailCell = document.createElement("td");
      emailCell.textContent = student.email;
      row.appendChild(emailCell);

      // Phone cell
      const phoneCell = document.createElement("td");
      phoneCell.textContent = student.phone || "N/A";
      row.appendChild(phoneCell);

      // Department cell
      const deptCell = document.createElement("td");
      deptCell.textContent = student.department || "N/A";
      row.appendChild(deptCell);

      // Year cell
      const yearCell = document.createElement("td");
      yearCell.textContent = student.year || "N/A";
      row.appendChild(yearCell);

      // Actions cell
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

      actionsDiv.appendChild(booksBtn);
      actionsDiv.appendChild(editBtn);
      actionsDiv.appendChild(deleteBtn);
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
        (s) =>
          s.student_id.toLowerCase().includes(searchTerm) ||
          s.name.toLowerCase().includes(searchTerm) ||
          s.email.toLowerCase().includes(searchTerm) ||
          (s.department && s.department.toLowerCase().includes(searchTerm)),
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
      showNotification("Please wait...", "warning");
      return;
    }

    this.operationInProgress = true;

    const student = {
      student_id: this.inputs.studentId.value.trim(),
      name: this.inputs.name.value.trim(),
      email: this.inputs.email.value.trim(),
      phone: this.inputs.phone.value.trim(),
      department: this.inputs.department.value.trim(),
      year: this.inputs.year.value,
    };

    const isEdit = !!this.editingStudent;
    this.hideForm();

    try {
      let result;
      if (isEdit) {
        result = await api.updateStudent(student);
      } else {
        result = await api.addStudent(student);
      }

      if (result.success) {
        showNotification(
          isEdit ? "Student updated!" : "Student added!",
          "success",
        );
        await this.loadData();

        if (window.app) {
          await window.app.loadStatistics();
          window.app.components.dashboard.update(
            this.data,
            window.app.components.books.data,
          );
        }
      } else {
        showNotification(`Error: ${result.error}`, "error");
        if (isEdit) {
          this.edit(student.student_id);
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

  async delete(studentId) {
    if (this.operationInProgress) {
      showNotification("Please wait...", "warning");
      return;
    }

    if (confirm("Are you sure you want to delete this student?")) {
      this.operationInProgress = true;

      try {
        const result = await api.deleteStudent(studentId);

        if (result.success) {
          showNotification("Student deleted!", "success");
          await this.loadData();

          if (window.app) {
            await window.app.loadStatistics();
            window.app.components.dashboard.update(
              this.data,
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

  async viewBooks(studentId) {
    try {
      const books = await api.getStudentBooks(studentId);
      const student = this.data.find((s) => s.student_id === studentId);

      let message = `Books borrowed by ${student.name} (${studentId}):\n\n`;

      if (books.length === 0) {
        message += "No books currently borrowed.";
      } else {
        books.forEach((book, index) => {
          const issueDate = new Date(book.issue_date).toLocaleDateString();
          const dueDate = new Date(book.due_date).toLocaleDateString();
          message += `${index + 1}. ${book.title} by ${book.author}\n`;
          message += `   ISBN: ${book.isbn}\n`;
          message += `   Issue Date: ${issueDate}\n`;
          message += `   Due Date: ${dueDate}\n\n`;
        });
      }

      alert(message);
    } catch (error) {
      showNotification("Error loading student books", "error");
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
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = null;
    }
  }
}

module.exports = Students;
