class Dashboard {
  constructor() {
    this.recentStudentsContainer = document.getElementById("recentStudents");
    this.recentBooksContainer = document.getElementById("recentBooks");
  }

  update(studentsData, booksData) {
    // FIXED: Added null checks
    if (studentsData) {
      this.updateRecentStudents(studentsData);
    }

    if (booksData) {
      this.updateRecentBooks(booksData);
    }
  }

  updateRecentStudents(studentsData) {
    // FIXED: Added null check
    if (!studentsData || !Array.isArray(studentsData)) {
      this.recentStudentsContainer.innerHTML = "<p>No students added yet.</p>";
      return;
    }

    const recent = studentsData.slice(0, 5);

    if (recent.length === 0) {
      this.recentStudentsContainer.innerHTML = "<p>No students added yet.</p>";
      return;
    }

    this.recentStudentsContainer.innerHTML = recent
      .map(
        (s) => `
        <div class="list-item">
          <strong>${this.escapeHtml(s.name)}</strong> (${this.escapeHtml(s.student_id)})<br>
          <small>${this.escapeHtml(s.department || "N/A")} - ${this.escapeHtml(s.year || "N/A")}</small>
        </div>
      `,
      )
      .join("");
  }

  updateRecentBooks(booksData) {
    // FIXED: Added null check
    if (!booksData || !Array.isArray(booksData)) {
      this.recentBooksContainer.innerHTML = "<p>No books added yet.</p>";
      return;
    }

    const recent = booksData.slice(0, 5);

    if (recent.length === 0) {
      this.recentBooksContainer.innerHTML = "<p>No books added yet.</p>";
      return;
    }

    this.recentBooksContainer.innerHTML = recent
      .map(
        (b) => `
        <div class="list-item">
          <strong>${this.escapeHtml(b.title)}</strong><br>
          <small>${this.escapeHtml(b.author)} | Available: ${b.available_copies}/${b.total_copies}</small>
        </div>
      `,
      )
      .join("");
  }

  // FIXED: Added HTML escaping for security
  escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}

module.exports = Dashboard;
