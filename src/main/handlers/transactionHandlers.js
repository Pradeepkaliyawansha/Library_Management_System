const { ipcMain } = require("electron");
const Transaction = require("../database/models/Transaction");
const Book = require("../database/models/Book");
const Student = require("../database/models/Student");
const cacheService = require("../services/cacheService");

// Issue book
ipcMain.handle("issue-book", async (event, transaction) => {
  try {
    const { student_id, isbn } = transaction;

    // Check for duplicate
    const hasDuplicate = Transaction.checkDuplicate(student_id, isbn);
    if (hasDuplicate) {
      return {
        success: false,
        error:
          "This student already has a copy of this book issued and hasn't returned it yet.",
      };
    }

    // Check if book exists and has available copies
    const book = Book.findByIsbn(isbn);
    if (!book) {
      return { success: false, error: "Book not found" };
    }

    if (book.available_copies <= 0) {
      return { success: false, error: "No copies available" };
    }

    // Check if student exists
    const student = Student.findById(student_id);
    if (!student) {
      return { success: false, error: "Student not found" };
    }

    // Calculate due date (14 days from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);
    const dueDateStr = dueDate.toISOString();

    // Create transaction
    Transaction.create({
      student_id,
      isbn,
      due_date: dueDateStr,
    });

    // Decrement available copies
    Book.decrementAvailableCopies(isbn);

    // Only invalidate necessary caches
    cacheService.invalidate(["transactions", "statistics"]);

    return { success: true };
  } catch (error) {
    console.error("Error issuing book:", error);
    return { success: false, error: error.message };
  }
});

// Return book - OPTIMIZED
ipcMain.handle("return-book", async (event, transactionId) => {
  try {
    // Get transaction details before updating
    const transaction = Transaction.findById(transactionId);

    if (!transaction) {
      return { success: false, error: "Transaction not found" };
    }

    if (transaction.status === "returned") {
      return { success: false, error: "Book already returned" };
    }

    // Store ISBN for book update
    const isbn = transaction.isbn;

    // Perform the return operation
    Transaction.returnBook(transactionId);

    // Only invalidate necessary caches
    // Don't invalidate books cache - just update statistics
    cacheService.invalidate(["transactions", "statistics"]);

    // Return updated data immediately for optimistic UI update
    return {
      success: true,
      transactionId,
      isbn,
      updateType: "return",
    };
  } catch (error) {
    console.error("Error returning book:", error);
    return { success: false, error: error.message };
  }
});

// Get all transactions - OPTIMIZED
ipcMain.handle("get-transactions", async () => {
  try {
    // Check cache first
    const cached = cacheService.get("transactions");
    if (cached) {
      return cached;
    }

    // Fetch from database
    const transactions = Transaction.findAll();

    // Cache the result with longer duration for this specific data
    cacheService.set("transactions", transactions, 1000); // 1 second cache

    return transactions;
  } catch (error) {
    console.error("Error getting transactions:", error);
    return [];
  }
});

// Delete transaction - OPTIMIZED
ipcMain.handle("delete-transaction", async (event, transactionId) => {
  try {
    Transaction.delete(transactionId);

    // Only invalidate transactions cache
    cacheService.invalidate(["transactions"]);

    return {
      success: true,
      transactionId,
      updateType: "delete",
    };
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return { success: false, error: error.message };
  }
});

// Get statistics - OPTIMIZED with extended cache
ipcMain.handle("get-statistics", async () => {
  try {
    // Check cache first with extended duration
    const cached = cacheService.get("statistics");
    if (cached) {
      return cached;
    }

    // Calculate statistics
    const stats = {
      totalStudents: Student.count(),
      totalBooks: Book.count(),
      totalCopies: Book.getTotalCopies(),
      availableCopies: Book.getAvailableCopies(),
      issuedBooks: Transaction.getIssuedCount(),
    };

    // Cache with longer duration - statistics change less frequently
    cacheService.set("statistics", stats, 2000); // 2 seconds cache

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

console.log("Transaction handlers registered (optimized)");
