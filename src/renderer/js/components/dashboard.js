class Dashboard {
  constructor() {
    this.recentStudentsContainer = document.getElementById("recentStudents");
    this.recentBooksContainer = document.getElementById("recentBooks");
  }

  update(studentsData, booksData) {
    this.updateRecentStudents(studentsData);
    this.updateRecentBooks(booksData);
  }

  updateRecentStudents(studentsData) {
    const recent = studentsData.slice(0, 5);

    if (recent.length === 0) {
      this.recentStudentsContainer.innerHTML = "<p>No students added yet.</p>";
      return;
    }

    this.recentStudentsContainer.innerHTML = recent
      .map(
        (s) => `
        <div class="list-item">
          <strong>${s.name}</strong> (${s.student_id})<br>
          <small>${s.department || "N/A"} - ${s.year || "N/A"}</small>
        </div>
      `,
      )
      .join("");
  }

  updateRecentBooks(booksData) {
    const recent = booksData.slice(0, 5);

    if (recent.length === 0) {
      this.recentBooksContainer.innerHTML = "<p>No books added yet.</p>";
      return;
    }

    this.recentBooksContainer.innerHTML = recent
      .map(
        (b) => `
        <div class="list-item">
          <strong>${b.title}</strong><br>
          <small>${b.author} | Available: ${b.available_copies}/${b.total_copies}</small>
        </div>
      `,
      )
      .join("");
  }
}

module.exports = Dashboard;
