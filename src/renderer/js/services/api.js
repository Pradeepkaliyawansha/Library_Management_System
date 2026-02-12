const { ipcRenderer } = require("electron");

class API {
  // Student operations
  async addStudent(student) {
    return await ipcRenderer.invoke("add-student", student);
  }

  async getStudents() {
    return await ipcRenderer.invoke("get-students");
  }

  async updateStudent(student) {
    return await ipcRenderer.invoke("update-student", student);
  }

  async deleteStudent(studentId) {
    return await ipcRenderer.invoke("delete-student", studentId);
  }

  async getStudentBooks(studentId) {
    return await ipcRenderer.invoke("get-student-books", studentId);
  }

  // Book operations
  async addBook(book) {
    return await ipcRenderer.invoke("add-book", book);
  }

  async getBooks() {
    return await ipcRenderer.invoke("get-books");
  }

  async updateBook(book) {
    return await ipcRenderer.invoke("update-book", book);
  }

  async deleteBook(isbn) {
    return await ipcRenderer.invoke("delete-book", isbn);
  }

  // Transaction operations
  async issueBook(transaction) {
    return await ipcRenderer.invoke("issue-book", transaction);
  }

  async returnBook(transactionId) {
    return await ipcRenderer.invoke("return-book", transactionId);
  }

  async getTransactions() {
    return await ipcRenderer.invoke("get-transactions");
  }

  async deleteTransaction(transactionId) {
    return await ipcRenderer.invoke("delete-transaction", transactionId);
  }

  // Statistics
  async getStatistics() {
    return await ipcRenderer.invoke("get-statistics");
  }

  // Export
  async exportToExcel(type, data) {
    return await ipcRenderer.invoke("export-to-excel", { type, data });
  }
}

module.exports = new API();
