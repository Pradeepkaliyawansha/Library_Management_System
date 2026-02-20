const { runQuery, executeQuery } = require("../db");
const Book = require("./Book");

// Reusable column mapper to avoid repetition
function mapRows(result) {
  if (!result || result.length === 0) return [];
  const { columns, values } = result[0];
  return values.map((row) => {
    const obj = {};
    columns.forEach((col, i) => {
      obj[col] = row[i];
    });
    return obj;
  });
}

class Transaction {
  static create(transactionData) {
    const { student_id, isbn, due_date } = transactionData;
    runQuery(
      `INSERT INTO transactions (student_id, isbn, due_date, status)
       VALUES (?, ?, ?, 'issued')`,
      [student_id, isbn, due_date],
    );
  }

  /**
   * Paginated findAll — the key fix for slow Transactions tab.
   * Default: latest 200 rows. Pass limit/offset for pagination.
   */
  static findAll(limit = 200, offset = 0) {
    const result = executeQuery(
      `
      SELECT
        t.id,
        t.student_id,
        s.name   AS student_name,
        t.isbn,
        b.title  AS book_title,
        t.issue_date,
        t.due_date,
        t.return_date,
        t.status
      FROM transactions t
      LEFT JOIN students s ON t.student_id = s.student_id
      LEFT JOIN books    b ON t.isbn        = b.isbn
      ORDER BY t.issue_date DESC
      LIMIT ? OFFSET ?
    `,
      [limit, offset],
    );

    return mapRows(result);
  }

  /** Total row count — used by pagination UI */
  static count() {
    const result = executeQuery("SELECT COUNT(*) AS cnt FROM transactions");
    return result.length > 0 ? result[0].values[0][0] : 0;
  }

  static findById(id) {
    const result = executeQuery("SELECT * FROM transactions WHERE id = ?", [
      id,
    ]);
    return mapRows(result)[0] || null;
  }

  static findByStudentId(studentId) {
    const result = executeQuery(
      `SELECT t.id, t.isbn, b.title, b.author,
              t.issue_date, t.due_date, t.status
       FROM transactions t
       LEFT JOIN books b ON t.isbn = b.isbn
       WHERE t.student_id = ? AND t.status = 'issued'
       ORDER BY t.issue_date DESC`,
      [studentId],
    );
    return mapRows(result);
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
    if (!transaction) throw new Error("Transaction not found");
    if (transaction.status === "returned")
      throw new Error("Book already returned");

    runQuery(
      `UPDATE transactions
       SET status = 'returned', return_date = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [id],
    );
    Book.incrementAvailableCopies(transaction.isbn);
  }

  static delete(id) {
    runQuery("DELETE FROM transactions WHERE id = ?", [id]);
  }

  static getIssuedCount() {
    const result = executeQuery(
      "SELECT COUNT(*) AS cnt FROM transactions WHERE status = 'issued'",
    );
    return result.length > 0 ? result[0].values[0][0] : 0;
  }

  static getOverdueTransactions() {
    const result = executeQuery(
      `SELECT t.id, t.student_id, s.name AS student_name,
              t.isbn, b.title AS book_title,
              t.issue_date, t.due_date, t.status
       FROM transactions t
       LEFT JOIN students s ON t.student_id = s.student_id
       LEFT JOIN books    b ON t.isbn        = b.isbn
       WHERE t.status = 'issued' AND t.due_date < datetime('now')
       ORDER BY t.due_date ASC`,
    );
    return mapRows(result);
  }

  static search(searchTerm) {
    const term = `%${searchTerm}%`;
    const result = executeQuery(
      `SELECT t.id, t.student_id, s.name AS student_name,
              t.isbn, b.title AS book_title,
              t.issue_date, t.due_date, t.return_date, t.status
       FROM transactions t
       LEFT JOIN students s ON t.student_id = s.student_id
       LEFT JOIN books    b ON t.isbn        = b.isbn
       WHERE t.student_id LIKE ?
          OR s.name       LIKE ?
          OR b.title      LIKE ?
          OR t.isbn       LIKE ?
       ORDER BY t.issue_date DESC
       LIMIT 500`,
      [term, term, term, term],
    );
    return mapRows(result);
  }
}

module.exports = Transaction;
