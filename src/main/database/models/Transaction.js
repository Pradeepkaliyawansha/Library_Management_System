const { getDatabase, runQuery, executeQuery } = require("../db");
const Book = require("./Book");

class Transaction {
  static create(transactionData) {
    const { student_id, isbn, due_date } = transactionData;

    runQuery(
      `INSERT INTO transactions (student_id, isbn, due_date, status)
       VALUES (?, ?, ?, 'issued')`,
      [student_id, isbn, due_date],
    );
  }

  static findAll() {
    const result = executeQuery(`
      SELECT 
        t.id,
        t.student_id,
        s.name as student_name,
        t.isbn,
        b.title as book_title,
        t.issue_date,
        t.due_date,
        t.return_date,
        t.status
      FROM transactions t
      LEFT JOIN students s ON t.student_id = s.student_id
      LEFT JOIN books b ON t.isbn = b.isbn
      ORDER BY t.issue_date DESC
    `);

    if (result.length === 0) {
      return [];
    }

    const columns = result[0].columns;
    const values = result[0].values;

    return values.map((row) => {
      const obj = {};
      columns.forEach((col, idx) => {
        obj[col] = row[idx];
      });
      return obj;
    });
  }

  static findById(id) {
    const result = executeQuery(`SELECT * FROM transactions WHERE id = ?`, [
      id,
    ]);

    if (result.length === 0 || result[0].values.length === 0) {
      return null;
    }

    const columns = result[0].columns;
    const values = result[0].values[0];

    const transaction = {};
    columns.forEach((col, idx) => {
      transaction[col] = values[idx];
    });

    return transaction;
  }

  static findByStudentId(studentId) {
    const result = executeQuery(
      `SELECT 
        t.id,
        t.isbn,
        b.title,
        b.author,
        t.issue_date,
        t.due_date,
        t.status
      FROM transactions t
      LEFT JOIN books b ON t.isbn = b.isbn
      WHERE t.student_id = ? AND t.status = 'issued'
      ORDER BY t.issue_date DESC`,
      [studentId],
    );

    if (result.length === 0) {
      return [];
    }

    const columns = result[0].columns;
    const values = result[0].values;

    return values.map((row) => {
      const obj = {};
      columns.forEach((col, idx) => {
        obj[col] = row[idx];
      });
      return obj;
    });
  }

  static checkDuplicate(studentId, isbn) {
    const result = executeQuery(
      `SELECT id FROM transactions 
       WHERE student_id = ? AND isbn = ? AND status = 'issued'`,
      [studentId, isbn],
    );

    return result.length > 0 && result[0].values.length > 0;
  }

  static returnBook(id) {
    const transaction = Transaction.findById(id);

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    if (transaction.status === "returned") {
      throw new Error("Book already returned");
    }

    runQuery(
      `UPDATE transactions 
       SET status = 'returned', return_date = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [id],
    );

    // Increment available copies
    Book.incrementAvailableCopies(transaction.isbn);
  }

  static delete(id) {
    runQuery("DELETE FROM transactions WHERE id = ?", [id]);
  }

  static getIssuedCount() {
    const result = executeQuery(
      `SELECT COUNT(*) as count FROM transactions WHERE status = 'issued'`,
    );
    if (result.length > 0 && result[0].values.length > 0) {
      return result[0].values[0][0];
    }
    return 0;
  }

  static getOverdueTransactions() {
    const result = executeQuery(
      `SELECT 
        t.id,
        t.student_id,
        s.name as student_name,
        t.isbn,
        b.title as book_title,
        t.issue_date,
        t.due_date,
        t.status
      FROM transactions t
      LEFT JOIN students s ON t.student_id = s.student_id
      LEFT JOIN books b ON t.isbn = b.isbn
      WHERE t.status = 'issued' AND t.due_date < datetime('now')
      ORDER BY t.due_date ASC`,
    );

    if (result.length === 0) {
      return [];
    }

    const columns = result[0].columns;
    const values = result[0].values;

    return values.map((row) => {
      const obj = {};
      columns.forEach((col, idx) => {
        obj[col] = row[idx];
      });
      return obj;
    });
  }

  static search(searchTerm) {
    const term = `%${searchTerm}%`;
    const result = executeQuery(
      `SELECT 
        t.id,
        t.student_id,
        s.name as student_name,
        t.isbn,
        b.title as book_title,
        t.issue_date,
        t.due_date,
        t.return_date,
        t.status
      FROM transactions t
      LEFT JOIN students s ON t.student_id = s.student_id
      LEFT JOIN books b ON t.isbn = b.isbn
      WHERE t.student_id LIKE ? 
      OR s.name LIKE ? 
      OR b.title LIKE ?
      ORDER BY t.issue_date DESC`,
      [term, term, term],
    );

    if (result.length === 0) {
      return [];
    }

    const columns = result[0].columns;
    const values = result[0].values;

    return values.map((row) => {
      const obj = {};
      columns.forEach((col, idx) => {
        obj[col] = row[idx];
      });
      return obj;
    });
  }
}

module.exports = Transaction;
