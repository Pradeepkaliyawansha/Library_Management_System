const { ipcMain } = require("electron");
const Book = require("../database/models/Book");
const cacheService = require("../services/cacheService");

// Add book
ipcMain.handle("add-book", async (event, book) => {
  try {
    Book.create(book);
    cacheService.invalidate(["books", "statistics"]);
    return { success: true };
  } catch (error) {
    console.error("Error adding book:", error);
    return { success: false, error: error.message };
  }
});

// Get all books
ipcMain.handle("get-books", async () => {
  try {
    // Check cache first
    const cached = cacheService.get("books");
    if (cached) {
      return cached;
    }

    // Fetch from database
    const books = Book.findAll();

    // Cache the result
    cacheService.set("books", books);

    return books;
  } catch (error) {
    console.error("Error getting books:", error);
    return [];
  }
});

// Update book
ipcMain.handle("update-book", async (event, book) => {
  try {
    Book.update(book);
    cacheService.invalidate(["books", "statistics"]);
    return { success: true };
  } catch (error) {
    console.error("Error updating book:", error);
    return { success: false, error: error.message };
  }
});

// Delete book
ipcMain.handle("delete-book", async (event, isbn) => {
  try {
    // Block deletion if book has active (unreturned) loans
    const Transaction = require("../database/models/Transaction");
    const activeLoans = Transaction.findActiveByIsbn(isbn);

    if (activeLoans.length > 0) {
      const borrowers = activeLoans
        .map((t) => `"${t.student_name || t.student_id}"`)
        .join(", ");
      return {
        success: false,
        error: `Cannot delete book. It is currently issued to ${activeLoans.length} student(s): ${borrowers}. Please return all copies first.`,
      };
    }

    Book.delete(isbn);
    cacheService.invalidate(["books", "statistics"]);
    return { success: true };
  } catch (error) {
    console.error("Error deleting book:", error);
    return { success: false, error: error.message };
  }
});

console.log("Book handlers registered");
