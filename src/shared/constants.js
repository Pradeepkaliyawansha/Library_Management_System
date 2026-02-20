/**
 * Shared constants between main and renderer processes
 * These values are used across the entire application
 */

// ==================== APPLICATION INFO ====================
const APP_INFO = {
  NAME: "Library Management System",
  VERSION: "1.0.0",
  DESCRIPTION: "University Library Management System",
  AUTHOR: "Pradeep Kaliyawansha",
  LICENSE: "MIT",
};

// ==================== DATABASE ====================
const DATABASE = {
  NAME: "library.db",
  VERSION: 1,
  SAVE_DELAY: 300, // milliseconds
  CACHE_DURATION: 500, // milliseconds
};

// ==================== TRANSACTION SETTINGS ====================
const TRANSACTION = {
  DEFAULT_LOAN_PERIOD: 14, // days
  MAX_BOOKS_PER_STUDENT: 5,
  RENEWAL_LIMIT: 2,
  OVERDUE_FINE_PER_DAY: 0.5, // dollars
};

// ==================== VALIDATION RULES ====================
const VALIDATION = {
  STUDENT_ID: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
    PATTERN: /^[a-zA-Z0-9-]+$/,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    PATTERN: /^[a-zA-Z\s\.\-']+$/,
  },
  EMAIL: {
    MAX_LENGTH: 254,
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  PHONE: {
    MIN_LENGTH: 7,
    MAX_LENGTH: 15,
    PATTERN: /^\+?\d{7,15}$/,
  },
  ISBN: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30,
    PATTERN: /^[a-zA-Z0-9\-\s]+$/,
  },
  BOOK_TITLE: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 200,
  },
  COPIES: {
    MIN: 1,
    MAX: 1000,
  },
};

// ==================== UI SETTINGS ====================
const UI = {
  DEBOUNCE_DELAY: 300, // milliseconds
  SEARCH_DEBOUNCE: 150, // milliseconds
  NOTIFICATION_DURATION: 3000, // milliseconds
  ANIMATION_DURATION: 300, // milliseconds
  ITEMS_PER_PAGE: 50,
  MAX_RECENT_ITEMS: 5,
};

// ==================== FILE EXPORT ====================
const EXPORT = {
  EXCEL_MAX_ROWS: 100000,
  PDF_MAX_PAGES: 1000,
  DEFAULT_FILENAME_PREFIX: "library_",
  DATE_FORMAT: "YYYY-MM-DD",
  SUPPORTED_FORMATS: ["xlsx", "csv", "pdf", "json"],
};

// ==================== STATUS TYPES ====================
const STATUS = {
  BOOK: {
    AVAILABLE: "available",
    ISSUED: "issued",
    RESERVED: "reserved",
    MAINTENANCE: "maintenance",
  },
  TRANSACTION: {
    ISSUED: "issued",
    RETURNED: "returned",
    OVERDUE: "overdue",
    LOST: "lost",
  },
  STUDENT: {
    ACTIVE: "active",
    INACTIVE: "inactive",
    SUSPENDED: "suspended",
    GRADUATED: "graduated",
  },
};

// ==================== ERROR MESSAGES ====================
const ERROR_MESSAGES = {
  // Database errors
  DB_INIT_FAILED: "Failed to initialize database",
  DB_SAVE_FAILED: "Failed to save database",
  DB_QUERY_FAILED: "Database query failed",

  // Student errors
  STUDENT_NOT_FOUND: "Student not found",
  STUDENT_ALREADY_EXISTS: "Student ID already exists",
  STUDENT_HAS_BOOKS: "Student has unreturned books",
  STUDENT_LIMIT_REACHED: "Student has reached maximum book limit",

  // Book errors
  BOOK_NOT_FOUND: "Book not found",
  BOOK_ALREADY_EXISTS: "Book ISBN already exists",
  BOOK_NOT_AVAILABLE: "No copies available",
  BOOK_ALREADY_ISSUED: "This book is already issued to the student",

  // Transaction errors
  TRANSACTION_NOT_FOUND: "Transaction not found",
  TRANSACTION_ALREADY_RETURNED: "Book already returned",
  INVALID_TRANSACTION: "Invalid transaction",

  // Validation errors
  INVALID_INPUT: "Invalid input data",
  REQUIRED_FIELD: "This field is required",
  INVALID_FORMAT: "Invalid format",

  // General errors
  UNKNOWN_ERROR: "An unknown error occurred",
  OPERATION_FAILED: "Operation failed",
  PERMISSION_DENIED: "Permission denied",
};

// ==================== SUCCESS MESSAGES ====================
const SUCCESS_MESSAGES = {
  STUDENT_ADDED: "Student added successfully",
  STUDENT_UPDATED: "Student updated successfully",
  STUDENT_DELETED: "Student deleted successfully",

  BOOK_ADDED: "Book added successfully",
  BOOK_UPDATED: "Book updated successfully",
  BOOK_DELETED: "Book deleted successfully",

  BOOK_ISSUED: "Book issued successfully",
  BOOK_RETURNED: "Book returned successfully",

  EXPORT_SUCCESS: "Data exported successfully",
  BACKUP_SUCCESS: "Database backup created successfully",
  RESTORE_SUCCESS: "Database restored successfully",
};

// ==================== NOTIFICATION TYPES ====================
const NOTIFICATION_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
};

// ==================== IPC CHANNELS ====================
const IPC_CHANNELS = {
  // Student channels
  ADD_STUDENT: "add-student",
  GET_STUDENTS: "get-students",
  UPDATE_STUDENT: "update-student",
  DELETE_STUDENT: "delete-student",
  GET_STUDENT_BOOKS: "get-student-books",

  // Book channels
  ADD_BOOK: "add-book",
  GET_BOOKS: "get-books",
  UPDATE_BOOK: "update-book",
  DELETE_BOOK: "delete-book",

  // Transaction channels
  ISSUE_BOOK: "issue-book",
  RETURN_BOOK: "return-book",
  GET_TRANSACTIONS: "get-transactions",
  DELETE_TRANSACTION: "delete-transaction",

  // Statistics
  GET_STATISTICS: "get-statistics",

  // Export
  EXPORT_TO_EXCEL: "export-to-excel",

  // Events (renderer to renderer)
  EXPORT_STUDENTS: "export-students",
  EXPORT_BOOKS: "export-books",
  EXPORT_TRANSACTIONS: "export-transactions",
  UPDATE_DOWNLOADING: "update-downloading",
  UPDATE_PROGRESS: "update-progress",
};

// ==================== THEMES ====================
const THEMES = {
  DARK: "dark",
  LIGHT: "light",
  AUTO: "auto",
};

// ==================== STUDENT YEARS ====================
const STUDENT_YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

// ==================== BOOK CATEGORIES ====================
const BOOK_CATEGORIES = [
  "Fiction",
  "Non-Fiction",
  "Science",
  "Technology",
  "Mathematics",
  "Engineering",
  "History",
  "Geography",
  "Literature",
  "Philosophy",
  "Psychology",
  "Business",
  "Economics",
  "Arts",
  "Reference",
  "Textbook",
  "Research",
  "Other",
];

// ==================== DEPARTMENTS ====================
const DEPARTMENTS = [
  "Computer Science",
  "Information Technology",
  "Software Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Business Administration",
  "Marketing",
  "Finance",
  "Accounting",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "History",
  "Psychology",
  "Other",
];

// ==================== DATE FORMATS ====================
const DATE_FORMATS = {
  SHORT: "MM/DD/YYYY",
  LONG: "MMMM DD, YYYY",
  WITH_TIME: "MM/DD/YYYY HH:mm",
  ISO: "YYYY-MM-DD",
  DISPLAY: "MMM DD, YYYY",
};

// ==================== KEYBOARD SHORTCUTS ====================
const SHORTCUTS = {
  NEW_STUDENT: "Ctrl+Shift+S",
  NEW_BOOK: "Ctrl+Shift+B",
  SEARCH: "Ctrl+F",
  SAVE: "Ctrl+S",
  REFRESH: "F5",
  TOGGLE_THEME: "Ctrl+Shift+T",
  EXPORT: "Ctrl+E",
  HELP: "F1",
};

// ==================== REGEX PATTERNS ====================
const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?\d{7,15}$/,
  ISBN_10: /^(?:\d{9}X|\d{10})$/,
  ISBN_13: /^\d{13}$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  ALPHANUMERIC_SPACE: /^[a-zA-Z0-9\s]+$/,
  URL: /^https?:\/\/.+/,
};

// ==================== API ENDPOINTS (if backend exists) ====================
const API_ENDPOINTS = {
  BASE_URL: process.env.API_URL || "http://localhost:3000",
  STUDENTS: "/api/students",
  BOOKS: "/api/books",
  TRANSACTIONS: "/api/transactions",
  STATISTICS: "/api/statistics",
  EXPORT: "/api/export",
};

// ==================== LOCAL STORAGE KEYS ====================
const STORAGE_KEYS = {
  THEME: "theme",
  LAST_BACKUP: "last_backup",
  USER_PREFERENCES: "user_preferences",
  RECENT_SEARCHES: "recent_searches",
  TABLE_COLUMNS: "table_columns",
  SORT_PREFERENCES: "sort_preferences",
};

// ==================== PERMISSIONS (if role-based access) ====================
const PERMISSIONS = {
  ADMIN: {
    CAN_ADD_STUDENT: true,
    CAN_EDIT_STUDENT: true,
    CAN_DELETE_STUDENT: true,
    CAN_ADD_BOOK: true,
    CAN_EDIT_BOOK: true,
    CAN_DELETE_BOOK: true,
    CAN_ISSUE_BOOK: true,
    CAN_RETURN_BOOK: true,
    CAN_EXPORT: true,
    CAN_BACKUP: true,
  },
  LIBRARIAN: {
    CAN_ADD_STUDENT: true,
    CAN_EDIT_STUDENT: true,
    CAN_DELETE_STUDENT: false,
    CAN_ADD_BOOK: true,
    CAN_EDIT_BOOK: true,
    CAN_DELETE_BOOK: false,
    CAN_ISSUE_BOOK: true,
    CAN_RETURN_BOOK: true,
    CAN_EXPORT: true,
    CAN_BACKUP: false,
  },
  VIEWER: {
    CAN_ADD_STUDENT: false,
    CAN_EDIT_STUDENT: false,
    CAN_DELETE_STUDENT: false,
    CAN_ADD_BOOK: false,
    CAN_EDIT_BOOK: false,
    CAN_DELETE_BOOK: false,
    CAN_ISSUE_BOOK: false,
    CAN_RETURN_BOOK: false,
    CAN_EXPORT: true,
    CAN_BACKUP: false,
  },
};

// ==================== EXPORTS ====================

// Export individual constants
module.exports = {
  APP_INFO,
  DATABASE,
  TRANSACTION,
  VALIDATION,
  UI,
  EXPORT,
  STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  NOTIFICATION_TYPES,
  IPC_CHANNELS,
  THEMES,
  STUDENT_YEARS,
  BOOK_CATEGORIES,
  DEPARTMENTS,
  DATE_FORMATS,
  SHORTCUTS,
  REGEX,
  API_ENDPOINTS,
  STORAGE_KEYS,
  PERMISSIONS,
};

// Export as a single default object for convenience
module.exports.default = {
  APP_INFO,
  DATABASE,
  TRANSACTION,
  VALIDATION,
  UI,
  EXPORT,
  STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  NOTIFICATION_TYPES,
  IPC_CHANNELS,
  THEMES,
  STUDENT_YEARS,
  BOOK_CATEGORIES,
  DEPARTMENTS,
  DATE_FORMATS,
  SHORTCUTS,
  REGEX,
  API_ENDPOINTS,
  STORAGE_KEYS,
  PERMISSIONS,
};
