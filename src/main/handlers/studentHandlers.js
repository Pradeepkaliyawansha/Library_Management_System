const { ipcMain } = require("electron");
const Student = require("../database/models/Student");
const cacheService = require("../services/cacheService");

// Add student
ipcMain.handle("add-student", async (event, student) => {
  try {
    Student.create(student);
    cacheService.invalidate(["students", "statistics"]);
    return { success: true };
  } catch (error) {
    console.error("Error adding student:", error);
    return { success: false, error: error.message };
  }
});

// Get all students
ipcMain.handle("get-students", async () => {
  try {
    // Check cache first
    const cached = cacheService.get("students");
    if (cached) {
      return cached;
    }

    // Fetch from database
    const students = Student.findAll();

    // Cache the result
    cacheService.set("students", students);

    return students;
  } catch (error) {
    console.error("Error getting students:", error);
    return [];
  }
});

// Update student
ipcMain.handle("update-student", async (event, student) => {
  try {
    Student.update(student);
    cacheService.invalidate(["students", "statistics"]);
    return { success: true };
  } catch (error) {
    console.error("Error updating student:", error);
    return { success: false, error: error.message };
  }
});

// Delete student
ipcMain.handle("delete-student", async (event, studentId) => {
  try {
    // Block deletion if student has active (unreturned) loans
    const Transaction = require("../database/models/Transaction");
    const activeLoans = Transaction.findByStudentId(studentId);

    if (activeLoans.length > 0) {
      const titles = activeLoans.map((t) => `"${t.title}"`).join(", ");
      return {
        success: false,
        error: `Cannot delete student. They have ${activeLoans.length} unreturned book(s): ${titles}. Please return all books first.`,
      };
    }

    Student.delete(studentId);
    cacheService.invalidate(["students", "statistics"]);
    return { success: true };
  } catch (error) {
    console.error("Error deleting student:", error);
    return { success: false, error: error.message };
  }
});

// Get student books
ipcMain.handle("get-student-books", async (event, studentId) => {
  try {
    const Transaction = require("../database/models/Transaction");
    return Transaction.findByStudentId(studentId);
  } catch (error) {
    console.error("Error getting student books:", error);
    return [];
  }
});

console.log("Student handlers registered");
