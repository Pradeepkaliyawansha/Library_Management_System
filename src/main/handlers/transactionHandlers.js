const { ipcMain } = require("electron");
const Transaction = require("../database/models/Transaction");
const Book = require("../database/models/Book");
const Student = require("../database/models/Student");
const cacheService = require("../services/cacheService");

// Issue book
ipcMain.handle("issue-book", async (event, transaction) => {
  try {
    const { student_id, isbn } = transaction;

    if (Transaction.checkDuplicate(student_id, isbn)) {
      return {
        success: false,
        error:
          "This student already has a copy of this book issued and hasn't returned it yet.",
      };
    }

    const book = Book.findByIsbn(isbn);
    if (!book) return { success: false, error: "Book not found" };
    if (book.available_copies <= 0)
      return { success: false, error: "No copies available" };

    const student = Student.findById(student_id);
    if (!student) return { success: false, error: "Student not found" };

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    Transaction.create({ student_id, isbn, due_date: dueDate.toISOString() });
    Book.decrementAvailableCopies(isbn);

    cacheService.invalidate(["transactions", "statistics", "books"]);
    return { success: true };
  } catch (error) {
    console.error("Error issuing book:", error);
    return { success: false, error: error.message };
  }
});

// Return book
ipcMain.handle("return-book", async (event, transactionId) => {
  try {
    const transaction = Transaction.findById(transactionId);
    if (!transaction) return { success: false, error: "Transaction not found" };
    if (transaction.status === "returned")
      return { success: false, error: "Book already returned" };

    Transaction.returnBook(transactionId);

    cacheService.invalidate(["transactions", "statistics", "books"]);
    return {
      success: true,
      transactionId,
      isbn: transaction.isbn,
      updateType: "return",
    };
  } catch (error) {
    console.error("Error returning book:", error);
    return { success: false, error: error.message };
  }
});

// Get transactions — paginated, aggressively cached
ipcMain.handle(
  "get-transactions",
  async (event, { limit = 200, offset = 0 } = {}) => {
    try {
      const cacheKey = `transactions_${offset}`;
      const cached = cacheService.get(cacheKey);
      if (cached) return cached;

      const transactions = Transaction.findAll(limit, offset);

      // Cache for 5 seconds — transactions change far less than every second
      cacheService.set(cacheKey, transactions, 5000);
      return transactions;
    } catch (error) {
      console.error("Error getting transactions:", error);
      return [];
    }
  },
);

// Delete transaction
ipcMain.handle("delete-transaction", async (event, transactionId) => {
  try {
    Transaction.delete(transactionId);
    cacheService.invalidate(["transactions", "transactions_0"]);
    return { success: true, transactionId, updateType: "delete" };
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return { success: false, error: error.message };
  }
});

// Statistics — cached for 5 seconds
ipcMain.handle("get-statistics", async () => {
  try {
    const cached = cacheService.get("statistics");
    if (cached) return cached;

    const stats = {
      totalStudents: Student.count(),
      totalBooks: Book.count(),
      totalCopies: Book.getTotalCopies(),
      availableCopies: Book.getAvailableCopies(),
      issuedBooks: Transaction.getIssuedCount(),
    };

    cacheService.set("statistics", stats, 5000);
    return stats;
  } catch (error) {
    console.error("Error getting statistics:", error);
    return {
      totalStudents: 0,
      totalBooks: 0,
      totalCopies: 0,
      availableCopies: 0,
      issuedBooks: 0,
    };
  }
});
