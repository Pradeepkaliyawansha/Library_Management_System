/**
 * Validation utility for form inputs
 * Provides reusable validation functions for the library management system
 */

class Validation {
  /**
   * Validate student ID format
   * @param {string} studentId - Student ID to validate
   * @returns {object} { isValid: boolean, error: string }
   */
  static validateStudentId(studentId) {
    if (!studentId || studentId.trim() === "") {
      return { isValid: false, error: "Student ID is required" };
    }

    if (studentId.length < 3) {
      return {
        isValid: false,
        error: "Student ID must be at least 3 characters",
      };
    }

    if (studentId.length > 20) {
      return {
        isValid: false,
        error: "Student ID must not exceed 20 characters",
      };
    }

    // Allow alphanumeric and hyphens
    const pattern = /^[a-zA-Z0-9-]+$/;
    if (!pattern.test(studentId)) {
      return {
        isValid: false,
        error: "Student ID can only contain letters, numbers, and hyphens",
      };
    }

    return { isValid: true, error: null };
  }

  /**
   * Validate student name
   * @param {string} name - Name to validate
   * @returns {object} { isValid: boolean, error: string }
   */
  static validateName(name) {
    if (!name || name.trim() === "") {
      return { isValid: false, error: "Name is required" };
    }

    if (name.length < 2) {
      return { isValid: false, error: "Name must be at least 2 characters" };
    }

    if (name.length > 100) {
      return { isValid: false, error: "Name must not exceed 100 characters" };
    }

    // Allow letters, spaces, and common name characters
    const pattern = /^[a-zA-Z\s\.\-']+$/;
    if (!pattern.test(name)) {
      return { isValid: false, error: "Name contains invalid characters" };
    }

    return { isValid: true, error: null };
  }

  /**
   * Validate email address
   * @param {string} email - Email to validate
   * @returns {object} { isValid: boolean, error: string }
   */
  static validateEmail(email) {
    if (!email || email.trim() === "") {
      return { isValid: false, error: "Email is required" };
    }

    // RFC 5322 compliant email regex (simplified)
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!pattern.test(email)) {
      return { isValid: false, error: "Invalid email format" };
    }

    if (email.length > 254) {
      return { isValid: false, error: "Email is too long" };
    }

    return { isValid: true, error: null };
  }

  /**
   * Validate phone number
   * @param {string} phone - Phone number to validate (optional field)
   * @returns {object} { isValid: boolean, error: string }
   */
  static validatePhone(phone) {
    // Phone is optional
    if (!phone || phone.trim() === "") {
      return { isValid: true, error: null };
    }

    // Remove common formatting characters
    const cleaned = phone.replace(/[\s\-\(\)\.]/g, "");

    // Allow digits and optional + prefix
    const pattern = /^\+?\d{7,15}$/;
    if (!pattern.test(cleaned)) {
      return { isValid: false, error: "Invalid phone number format" };
    }

    return { isValid: true, error: null };
  }

  /**
   * Validate ISBN (Book number)
   * @param {string} isbn - ISBN to validate
   * @returns {object} { isValid: boolean, error: string }
   */
  static validateISBN(isbn) {
    if (!isbn || isbn.trim() === "") {
      return { isValid: false, error: "Book number/ISBN is required" };
    }

    if (isbn.length < 3) {
      return {
        isValid: false,
        error: "Book number must be at least 3 characters",
      };
    }

    if (isbn.length > 30) {
      return {
        isValid: false,
        error: "Book number must not exceed 30 characters",
      };
    }

    // Allow alphanumeric, hyphens, and spaces
    const pattern = /^[a-zA-Z0-9\-\s]+$/;
    if (!pattern.test(isbn)) {
      return {
        isValid: false,
        error: "Book number contains invalid characters",
      };
    }

    return { isValid: true, error: null };
  }

  /**
   * Validate book title
   * @param {string} title - Book title to validate
   * @returns {object} { isValid: boolean, error: string }
   */
  static validateBookTitle(title) {
    if (!title || title.trim() === "") {
      return { isValid: false, error: "Book title is required" };
    }

    if (title.length < 1) {
      return {
        isValid: false,
        error: "Book title must be at least 1 character",
      };
    }

    if (title.length > 200) {
      return {
        isValid: false,
        error: "Book title must not exceed 200 characters",
      };
    }

    return { isValid: true, error: null };
  }

  /**
   * Validate author name
   * @param {string} author - Author name to validate
   * @returns {object} { isValid: boolean, error: string }
   */
  static validateAuthor(author) {
    if (!author || author.trim() === "") {
      return { isValid: false, error: "Author name is required" };
    }

    if (author.length < 2) {
      return {
        isValid: false,
        error: "Author name must be at least 2 characters",
      };
    }

    if (author.length > 100) {
      return {
        isValid: false,
        error: "Author name must not exceed 100 characters",
      };
    }

    return { isValid: true, error: null };
  }

  /**
   * Validate number of copies
   * @param {number|string} copies - Number of copies to validate
   * @returns {object} { isValid: boolean, error: string }
   */
  static validateCopies(copies) {
    const num = parseInt(copies);

    if (isNaN(num)) {
      return {
        isValid: false,
        error: "Number of copies must be a valid number",
      };
    }

    if (num < 1) {
      return { isValid: false, error: "Number of copies must be at least 1" };
    }

    if (num > 1000) {
      return { isValid: false, error: "Number of copies must not exceed 1000" };
    }

    return { isValid: true, error: null };
  }

  /**
   * Validate department name
   * @param {string} department - Department to validate (optional)
   * @returns {object} { isValid: boolean, error: string }
   */
  static validateDepartment(department) {
    // Department is optional
    if (!department || department.trim() === "") {
      return { isValid: true, error: null };
    }

    if (department.length > 100) {
      return {
        isValid: false,
        error: "Department name must not exceed 100 characters",
      };
    }

    return { isValid: true, error: null };
  }

  /**
   * Validate student form data
   * @param {object} studentData - Student data object
   * @returns {object} { isValid: boolean, errors: object }
   */
  static validateStudentForm(studentData) {
    const errors = {};

    const studentIdResult = this.validateStudentId(studentData.student_id);
    if (!studentIdResult.isValid) {
      errors.student_id = studentIdResult.error;
    }

    const nameResult = this.validateName(studentData.name);
    if (!nameResult.isValid) {
      errors.name = nameResult.error;
    }

    const emailResult = this.validateEmail(studentData.email);
    if (!emailResult.isValid) {
      errors.email = emailResult.error;
    }

    const phoneResult = this.validatePhone(studentData.phone);
    if (!phoneResult.isValid) {
      errors.phone = phoneResult.error;
    }

    const departmentResult = this.validateDepartment(studentData.department);
    if (!departmentResult.isValid) {
      errors.department = departmentResult.error;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors: errors,
    };
  }

  /**
   * Validate book form data
   * @param {object} bookData - Book data object
   * @returns {object} { isValid: boolean, errors: object }
   */
  static validateBookForm(bookData) {
    const errors = {};

    const isbnResult = this.validateISBN(bookData.isbn);
    if (!isbnResult.isValid) {
      errors.isbn = isbnResult.error;
    }

    const titleResult = this.validateBookTitle(bookData.title);
    if (!titleResult.isValid) {
      errors.title = titleResult.error;
    }

    const authorResult = this.validateAuthor(bookData.author);
    if (!authorResult.isValid) {
      errors.author = authorResult.error;
    }

    const copiesResult = this.validateCopies(bookData.total_copies);
    if (!copiesResult.isValid) {
      errors.total_copies = copiesResult.error;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors: errors,
    };
  }

  /**
   * Sanitize string input (remove dangerous characters)
   * @param {string} input - Input string to sanitize
   * @returns {string} Sanitized string
   */
  static sanitizeInput(input) {
    if (!input) return "";

    return input
      .trim()
      .replace(/[<>]/g, "") // Remove potential HTML tags
      .replace(/[\x00-\x1F\x7F]/g, ""); // Remove control characters
  }

  /**
   * Display validation errors on form
   * @param {object} errors - Errors object with field names as keys
   * @param {string} formId - Form ID to display errors on
   */
  static displayFormErrors(errors, formId) {
    // Clear previous errors
    const form = document.getElementById(formId);
    if (!form) return;

    const errorElements = form.querySelectorAll(".error-message");
    errorElements.forEach((el) => el.remove());

    // Display new errors
    Object.keys(errors).forEach((fieldName) => {
      const input = form.querySelector(`#${fieldName}`);
      if (input) {
        // Add error class to input
        input.classList.add("error");

        // Create error message element
        const errorDiv = document.createElement("div");
        errorDiv.className = "error-message";
        errorDiv.textContent = errors[fieldName];
        errorDiv.style.cssText =
          "color: #ef4444; font-size: 0.875rem; margin-top: 0.25rem;";

        // Insert error message after input
        input.parentNode.insertBefore(errorDiv, input.nextSibling);
      }
    });
  }

  /**
   * Clear validation errors from form
   * @param {string} formId - Form ID to clear errors from
   */
  static clearFormErrors(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    // Remove error classes
    const inputs = form.querySelectorAll("input.error, select.error");
    inputs.forEach((input) => input.classList.remove("error"));

    // Remove error messages
    const errorElements = form.querySelectorAll(".error-message");
    errorElements.forEach((el) => el.remove());
  }

  /**
   * Check if string is empty or whitespace
   * @param {string} str - String to check
   * @returns {boolean} True if empty or whitespace
   */
  static isEmpty(str) {
    return !str || str.trim() === "";
  }

  /**
   * Validate required fields in a form
   * @param {object} data - Data object to validate
   * @param {array} requiredFields - Array of required field names
   * @returns {object} { isValid: boolean, errors: object }
   */
  static validateRequired(data, requiredFields) {
    const errors = {};

    requiredFields.forEach((field) => {
      if (this.isEmpty(data[field])) {
        errors[field] = `${this.formatFieldName(field)} is required`;
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors: errors,
    };
  }

  /**
   * Format field name for display
   * @param {string} fieldName - Field name to format
   * @returns {string} Formatted field name
   */
  static formatFieldName(fieldName) {
    return fieldName
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }
}

// Add CSS for error styling if not already present
function initValidationStyles() {
  if (!document.getElementById("validationStyles")) {
    const style = document.createElement("style");
    style.id = "validationStyles";
    style.textContent = `
      input.error,
      select.error {
        border-color: #ef4444 !important;
        background-color: rgba(239, 68, 68, 0.05) !important;
      }
      
      input.error:focus,
      select.error:focus {
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
      }
      
      .error-message {
        color: #ef4444;
        font-size: 0.875rem;
        margin-top: 0.25rem;
        animation: errorFadeIn 0.3s ease-out;
      }
      
      @keyframes errorFadeIn {
        from {
          opacity: 0;
          transform: translateY(-5px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
  }
}

// Initialize styles on load
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initValidationStyles);
  } else {
    initValidationStyles();
  }
}

module.exports = Validation;
