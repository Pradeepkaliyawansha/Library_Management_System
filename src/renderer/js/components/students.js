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
    window.filterStudents = () => this.handleSearch(); // FIXED: Added global filter function
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

    // FIXED: Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();
    const tempDiv = document.createElement("div");

    tempDiv.innerHTML = this.filteredData
      .map(
        (student) => `
        <tr>
          <td>${student.student_id}</td>
          <td>${student.name}</td>
          <td>${student.email}</td>
          <td>${student.phone || "N/A"}</td>
          <td>${student.department || "N/A"}</td>
          <td>${student.year || "N/A"}</td>
          <td>
            <div class="table-actions">
              <button class="btn-small btn-info" onclick="viewStudentBooks('${student.student_id}')">Books</button>
              <button class="btn-small btn-primary" onclick="editStudent('${student.student_id}')">Edit</button>
              <button class="btn-small btn-danger" onclick="deleteStudent('${student.student_id}')">Delete</button>
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
    this.inputs.studentId.readOnly = false; // FIXED: Added readOnly reset
    this.form.reset();
    this.formContainer.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  hideForm() {
    this.formContainer.style.display = "none";
    this.form.reset();
    this.editingStudent = null;
    // FIXED: Reset disabled state
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
    this.inputs.studentId.readOnly = true; // FIXED: Added readOnly for better form handling
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

        // Refresh app statistics
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

  // FIXED: Added cleanup method
  destroy() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = null;
    }
  }
}

module.exports = Students;
