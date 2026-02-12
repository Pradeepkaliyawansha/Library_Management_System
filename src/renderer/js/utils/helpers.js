/**
 * Helper utility functions for the library management system
 * Provides reusable helper functions for common tasks
 */

class Helpers {
  /**
   * Format date to local date string
   * @param {string|Date} date - Date to format
   * @param {string} format - Format type ('short', 'long', 'time')
   * @returns {string} Formatted date string
   */
  static formatDate(date, format = "short") {
    if (!date) return "N/A";

    const dateObj = typeof date === "string" ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) return "Invalid Date";

    const options = {
      short: { year: "numeric", month: "2-digit", day: "2-digit" },
      long: { year: "numeric", month: "long", day: "numeric" },
      time: {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      },
    };

    return dateObj.toLocaleDateString(
      "en-US",
      options[format] || options.short,
    );
  }

  /**
   * Calculate days between two dates
   * @param {string|Date} startDate - Start date
   * @param {string|Date} endDate - End date
   * @returns {number} Number of days
   */
  static daysBetween(startDate, endDate) {
    const start =
      typeof startDate === "string" ? new Date(startDate) : startDate;
    const end = typeof endDate === "string" ? new Date(endDate) : endDate;

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  /**
   * Check if date is overdue (past current date)
   * @param {string|Date} dueDate - Due date to check
   * @returns {boolean} True if overdue
   */
  static isOverdue(dueDate) {
    if (!dueDate) return false;

    const due = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
    const now = new Date();

    return due < now;
  }

  /**
   * Calculate due date from issue date
   * @param {string|Date} issueDate - Issue date
   * @param {number} days - Number of days to add (default: 14)
   * @returns {Date} Due date
   */
  static calculateDueDate(issueDate, days = 14) {
    const issue =
      typeof issueDate === "string" ? new Date(issueDate) : issueDate;
    const due = new Date(issue);
    due.setDate(due.getDate() + days);
    return due;
  }

  /**
   * Format number with thousand separators
   * @param {number} num - Number to format
   * @returns {string} Formatted number
   */
  static formatNumber(num) {
    if (num === null || num === undefined) return "0";
    return num.toLocaleString("en-US");
  }

  /**
   * Truncate string to specified length
   * @param {string} str - String to truncate
   * @param {number} length - Maximum length
   * @param {string} suffix - Suffix to add (default: '...')
   * @returns {string} Truncated string
   */
  static truncate(str, length, suffix = "...") {
    if (!str) return "";
    if (str.length <= length) return str;
    return str.substring(0, length - suffix.length) + suffix;
  }

  /**
   * Capitalize first letter of string
   * @param {string} str - String to capitalize
   * @returns {string} Capitalized string
   */
  static capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * Convert string to title case
   * @param {string} str - String to convert
   * @returns {string} Title case string
   */
  static toTitleCase(str) {
    if (!str) return "";
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  /**
   * Generate unique ID
   * @param {string} prefix - Optional prefix
   * @returns {string} Unique ID
   */
  static generateId(prefix = "") {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 9);
    return prefix ? `${prefix}_${timestamp}${random}` : `${timestamp}${random}`;
  }

  /**
   * Debounce function execution
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  static debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Throttle function execution
   * @param {Function} func - Function to throttle
   * @param {number} limit - Limit time in milliseconds
   * @returns {Function} Throttled function
   */
  static throttle(func, limit = 300) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  /**
   * Deep clone an object
   * @param {object} obj - Object to clone
   * @returns {object} Cloned object
   */
  static deepClone(obj) {
    if (obj === null || typeof obj !== "object") return obj;
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Check if object is empty
   * @param {object} obj - Object to check
   * @returns {boolean} True if empty
   */
  static isEmptyObject(obj) {
    return Object.keys(obj).length === 0;
  }

  /**
   * Sort array of objects by property
   * @param {Array} array - Array to sort
   * @param {string} property - Property to sort by
   * @param {string} order - Sort order ('asc' or 'desc')
   * @returns {Array} Sorted array
   */
  static sortByProperty(array, property, order = "asc") {
    return [...array].sort((a, b) => {
      const aVal = a[property];
      const bVal = b[property];

      if (aVal < bVal) return order === "asc" ? -1 : 1;
      if (aVal > bVal) return order === "asc" ? 1 : -1;
      return 0;
    });
  }

  /**
   * Filter array by search term
   * @param {Array} array - Array to filter
   * @param {string} searchTerm - Search term
   * @param {Array} properties - Properties to search in
   * @returns {Array} Filtered array
   */
  static filterBySearch(array, searchTerm, properties) {
    if (!searchTerm) return array;

    const term = searchTerm.toLowerCase();

    return array.filter((item) => {
      return properties.some((prop) => {
        const value = item[prop];
        return value && value.toString().toLowerCase().includes(term);
      });
    });
  }

  /**
   * Group array by property
   * @param {Array} array - Array to group
   * @param {string} property - Property to group by
   * @returns {object} Grouped object
   */
  static groupBy(array, property) {
    return array.reduce((acc, item) => {
      const key = item[property];
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});
  }

  /**
   * Get unique values from array
   * @param {Array} array - Array to get unique values from
   * @param {string} property - Optional property to get unique values of
   * @returns {Array} Array of unique values
   */
  static unique(array, property = null) {
    if (property) {
      return [...new Set(array.map((item) => item[property]))];
    }
    return [...new Set(array)];
  }

  /**
   * Calculate percentage
   * @param {number} value - Value
   * @param {number} total - Total
   * @param {number} decimals - Number of decimal places
   * @returns {number} Percentage
   */
  static calculatePercentage(value, total, decimals = 2) {
    if (total === 0) return 0;
    return parseFloat(((value / total) * 100).toFixed(decimals));
  }

  /**
   * Format file size in bytes to human readable
   * @param {number} bytes - Size in bytes
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted size
   */
  static formatFileSize(bytes, decimals = 2) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  /**
   * Generate random color
   * @param {string} type - Color type ('hex', 'rgb', 'hsl')
   * @returns {string} Random color
   */
  static randomColor(type = "hex") {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);

    switch (type) {
      case "rgb":
        return `rgb(${r}, ${g}, ${b})`;
      case "hsl":
        const h = Math.floor(Math.random() * 360);
        const s = Math.floor(Math.random() * 100);
        const l = Math.floor(Math.random() * 100);
        return `hsl(${h}, ${s}%, ${l}%)`;
      default:
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }
  }

  /**
   * Copy text to clipboard
   * @param {string} text - Text to copy
   * @returns {Promise<boolean>} Success status
   */
  static async copyToClipboard(text) {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for older browsers
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        return true;
      }
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      return false;
    }
  }

  /**
   * Download data as file
   * @param {string} data - Data to download
   * @param {string} filename - File name
   * @param {string} type - MIME type
   */
  static downloadFile(data, filename, type = "text/plain") {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Escape HTML special characters
   * @param {string} str - String to escape
   * @returns {string} Escaped string
   */
  static escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Get query parameters from URL
   * @returns {object} Query parameters object
   */
  static getQueryParams() {
    const params = {};
    const queryString = window.location.search.substring(1);
    const pairs = queryString.split("&");

    pairs.forEach((pair) => {
      const [key, value] = pair.split("=");
      if (key) {
        params[decodeURIComponent(key)] = decodeURIComponent(value || "");
      }
    });

    return params;
  }

  /**
   * Scroll to element smoothly
   * @param {string|HTMLElement} element - Element or selector
   * @param {string} position - Position ('start', 'center', 'end')
   */
  static scrollToElement(element, position = "center") {
    const el =
      typeof element === "string" ? document.querySelector(element) : element;

    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: position,
      });
    }
  }

  /**
   * Check if element is in viewport
   * @param {HTMLElement} element - Element to check
   * @returns {boolean} True if in viewport
   */
  static isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  /**
   * Wait for specified time
   * @param {number} ms - Milliseconds to wait
   * @returns {Promise} Promise that resolves after wait time
   */
  static sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Retry function with exponential backoff
   * @param {Function} fn - Function to retry
   * @param {number} maxRetries - Maximum number of retries
   * @param {number} delay - Initial delay in milliseconds
   * @returns {Promise} Promise that resolves with function result
   */
  static async retry(fn, maxRetries = 3, delay = 1000) {
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (i < maxRetries - 1) {
          await this.sleep(delay * Math.pow(2, i));
        }
      }
    }

    throw lastError;
  }

  /**
   * Get browser information
   * @returns {object} Browser information
   */
  static getBrowserInfo() {
    const ua = navigator.userAgent;
    let browserName = "Unknown";
    let browserVersion = "Unknown";

    if (ua.indexOf("Firefox") > -1) {
      browserName = "Firefox";
      browserVersion = ua.match(/Firefox\/(\d+)/)[1];
    } else if (ua.indexOf("Chrome") > -1) {
      browserName = "Chrome";
      browserVersion = ua.match(/Chrome\/(\d+)/)[1];
    } else if (ua.indexOf("Safari") > -1) {
      browserName = "Safari";
      browserVersion = ua.match(/Version\/(\d+)/)[1];
    } else if (ua.indexOf("MSIE") > -1 || ua.indexOf("Trident/") > -1) {
      browserName = "Internet Explorer";
      browserVersion = ua.match(/(?:MSIE |rv:)(\d+)/)[1];
    }

    return {
      name: browserName,
      version: browserVersion,
      userAgent: ua,
    };
  }

  /**
   * Check if running in Electron
   * @returns {boolean} True if running in Electron
   */
  static isElectron() {
    return (
      typeof window !== "undefined" &&
      typeof window.process === "object" &&
      window.process.type === "renderer"
    );
  }

  /**
   * Format currency
   * @param {number} amount - Amount to format
   * @param {string} currency - Currency code (default: USD)
   * @returns {string} Formatted currency string
   */
  static formatCurrency(amount, currency = "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  }

  /**
   * Get time ago string
   * @param {string|Date} date - Date to compare
   * @returns {string} Time ago string
   */
  static timeAgo(date) {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    const seconds = Math.floor((new Date() - dateObj) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";

    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";

    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";

    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";

    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";

    return Math.floor(seconds) + " seconds ago";
  }
}

module.exports = Helpers;
