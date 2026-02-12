// src/main/database/models/Student.js
const { getDatabase, runQuery, executeQuery } = require("../db");

class Student {
  static create(studentData) {
    const { student_id, name, email, phone, department, year } = studentData;

    runQuery(
      `INSERT INTO students (student_id, name, email, phone, department, year)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [student_id, name, email, phone, department, year],
    );
  }

  static findAll() {
    const result = executeQuery(
      "SELECT * FROM students ORDER BY created_at DESC",
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

  static findById(studentId) {
    const result = executeQuery("SELECT * FROM students WHERE student_id = ?", [
      studentId,
    ]);

    if (result.length === 0 || result[0].values.length === 0) {
      return null;
    }

    const columns = result[0].columns;
    const values = result[0].values[0];

    const student = {};
    columns.forEach((col, idx) => {
      student[col] = values[idx];
    });

    return student;
  }

  static update(studentData) {
    const { student_id, name, email, phone, department, year } = studentData;

    runQuery(
      `UPDATE students 
       SET name = ?, email = ?, phone = ?, department = ?, year = ?
       WHERE student_id = ?`,
      [name, email, phone, department, year, student_id],
    );
  }

  static delete(studentId) {
    runQuery("DELETE FROM students WHERE student_id = ?", [studentId]);
  }

  static count() {
    const result = executeQuery("SELECT COUNT(*) as count FROM students");
    if (result.length > 0 && result[0].values.length > 0) {
      return result[0].values[0][0];
    }
    return 0;
  }

  static search(searchTerm) {
    const term = `%${searchTerm}%`;
    const result = executeQuery(
      `SELECT * FROM students 
       WHERE student_id LIKE ? 
       OR name LIKE ? 
       OR email LIKE ? 
       OR department LIKE ?
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
      `SELECT * FROM students ORDER BY created_at DESC LIMIT ?`,
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

module.exports = Student;
