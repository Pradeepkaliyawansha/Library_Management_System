const { getDatabase, runQuery, executeQuery } = require("../db");

class Book {
  static create(bookData) {
    const {
      isbn,
      title,
      author,
      publisher,
      category,
      total_copies,
      available_copies,
    } = bookData;

    runQuery(
      `INSERT INTO books (isbn, title, author, publisher, category, total_copies, available_copies)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        isbn,
        title,
        author,
        publisher,
        category,
        total_copies,
        available_copies,
      ],
    );
  }

  static findAll() {
    const result = executeQuery("SELECT * FROM books ORDER BY created_at DESC");

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

  static findByIsbn(isbn) {
    const result = executeQuery("SELECT * FROM books WHERE isbn = ?", [isbn]);

    if (result.length === 0 || result[0].values.length === 0) {
      return null;
    }

    const columns = result[0].columns;
    const values = result[0].values[0];

    const book = {};
    columns.forEach((col, idx) => {
      book[col] = values[idx];
    });

    return book;
  }

  static update(bookData) {
    const {
      isbn,
      title,
      author,
      publisher,
      category,
      total_copies,
      available_copies,
    } = bookData;

    runQuery(
      `UPDATE books 
       SET title = ?, author = ?, publisher = ?, category = ?, total_copies = ?, available_copies = ?
       WHERE isbn = ?`,
      [
        title,
        author,
        publisher,
        category,
        total_copies,
        available_copies,
        isbn,
      ],
    );
  }

  static delete(isbn) {
    runQuery("DELETE FROM books WHERE isbn = ?", [isbn]);
  }

  static count() {
    const result = executeQuery("SELECT COUNT(*) as count FROM books");
    if (result.length > 0 && result[0].values.length > 0) {
      return result[0].values[0][0];
    }
    return 0;
  }

  static getTotalCopies() {
    const result = executeQuery("SELECT SUM(total_copies) as total FROM books");
    if (result.length > 0 && result[0].values.length > 0) {
      return result[0].values[0][0] || 0;
    }
    return 0;
  }

  static getAvailableCopies() {
    const result = executeQuery(
      "SELECT SUM(available_copies) as available FROM books",
    );
    if (result.length > 0 && result[0].values.length > 0) {
      return result[0].values[0][0] || 0;
    }
    return 0;
  }

  static decrementAvailableCopies(isbn) {
    runQuery(
      "UPDATE books SET available_copies = available_copies - 1 WHERE isbn = ?",
      [isbn],
    );
  }

  static incrementAvailableCopies(isbn) {
    runQuery(
      "UPDATE books SET available_copies = available_copies + 1 WHERE isbn = ?",
      [isbn],
    );
  }

  static search(searchTerm) {
    const term = `%${searchTerm}%`;
    const result = executeQuery(
      `SELECT * FROM books 
       WHERE isbn LIKE ? 
       OR title LIKE ? 
       OR author LIKE ? 
       OR category LIKE ?
       ORDER BY created_at DESC`,
      [term, term, term, term],
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

  static getRecent(limit = 5) {
    const result = executeQuery(
      `SELECT * FROM books ORDER BY created_at DESC LIMIT ?`,
      [limit],
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

module.exports = Book;
