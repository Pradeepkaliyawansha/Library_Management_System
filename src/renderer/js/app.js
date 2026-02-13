const { ipcRenderer } = require("electron");
const api = require("./services/api");
const { showNotification } = require("./services/notifications");
const { initTheme } = require("./utils/theme");
const Dashboard = require("./components/dashboard");
const Students = require("./components/students");
const Books = require("./components/books");
const Transactions = require("./components/transactions");
const Analytics = require("./components/analytics");

class App {
  constructor() {
    this.currentTab = "dashboard";
    this.components = {
      dashboard: null,
      students: null,
      books: null,
      transactions: null,
      analytics: null,
    };
    this.isLoading = false;
  }

  async init() {
    console.log("Initializing application...");

    // Initialize theme
    initTheme();

    // Initialize components
    this.components.dashboard = new Dashboard();
    this.components.students = new Students();
    this.components.books = new Books();
    this.components.transactions = new Transactions();
    this.components.analytics = new Analytics();

    // Setup event listeners
    this.setupEventListeners();

    // Load initial data
    await this.loadInitialData();

    console.log("Application initialized");
  }

  setupEventListeners() {
    // Tab switching
    window.showTab = (tabName) => this.showTab(tabName);

    // Export listeners
    ipcRenderer.on("export-students", () => {
      this.components.students.exportToExcel();
    });

    ipcRenderer.on("export-books", () => {
      this.components.books.exportToExcel();
    });

    ipcRenderer.on("export-transactions", () => {
      this.components.transactions.exportToExcel();
    });

    // Update progress listeners
    ipcRenderer.on("update-downloading", () => {
      showNotification("Downloading update...", "info");
    });

    ipcRenderer.on("update-progress", (event, progressObj) => {
      const percent = Math.round(progressObj.percent);
      showNotification(`Downloading update: ${percent}%`, "info");
    });
  }

  async loadInitialData() {
    const startTime = performance.now();

    try {
      // Load statistics first (fastest)
      await this.loadStatistics();

      // Load other data in parallel
      const results = await Promise.allSettled([
        this.components.students.loadData(),
        this.components.books.loadData(),
        this.components.transactions.loadData(),
      ]);

      // Check for failures
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          const componentNames = ["students", "books", "transactions"];
          console.error(
            `Failed to load ${componentNames[index]}:`,
            result.reason,
          );
        }
      });

      // Update dashboard only if we have data
      if (this.components.students.data && this.components.books.data) {
        this.components.dashboard.update(
          this.components.students.data,
          this.components.books.data,
        );
      }

      const endTime = performance.now();
      console.log(`Data loaded in ${(endTime - startTime).toFixed(2)}ms`);
    } catch (error) {
      console.error("Error loading initial data:", error);
      showNotification("Error loading data", "error");
    }
  }

  async loadStatistics() {
    try {
      const stats = await api.getStatistics();
      this.updateStatisticsDisplay(stats);
    } catch (error) {
      console.error("Error loading statistics:", error);
      this.updateStatisticsDisplay({
        totalStudents: 0,
        totalBooks: 0,
        availableCopies: 0,
        issuedBooks: 0,
      });
    }
  }

  updateStatisticsDisplay(stats) {
    const updateElement = (id, value) => {
      const element = document.getElementById(id);
      if (element) {
        // Animate number change
        const currentValue = parseInt(element.textContent) || 0;
        if (currentValue !== value) {
          this.animateValue(element, currentValue, value, 300);
        }
      }
    };

    updateElement("totalStudents", stats.totalStudents);
    updateElement("totalBooks", stats.totalBooks);
    updateElement("availableCopies", stats.availableCopies);
    updateElement("issuedBooks", stats.issuedBooks);
  }

  animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16); // 60fps
    let current = start;

    const timer = setInterval(() => {
      current += increment;

      if (
        (increment > 0 && current >= end) ||
        (increment < 0 && current <= end)
      ) {
        current = end;
        clearInterval(timer);
      }

      element.textContent = Math.round(current);
    }, 16);
  }

  showTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll(".tab-content");
    const buttons = document.querySelectorAll(".tab-button");

    tabs.forEach((tab) => tab.classList.remove("active"));
    buttons.forEach((btn) => btn.classList.remove("active"));

    // Show selected tab
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
      selectedTab.classList.add("active");
    }

    const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeButton) {
      activeButton.classList.add("active");
    }

    this.currentTab = tabName;
  }

  async refreshData() {
    if (this.isLoading) {
      console.log("Already loading data, skipping refresh");
      return;
    }

    this.isLoading = true;

    try {
      await this.loadInitialData();
    } finally {
      this.isLoading = false;
    }
  }

  destroy() {
    // Cleanup all components
    if (this.components.students) {
      this.components.students.destroy();
    }
    if (this.components.books) {
      this.components.books.destroy();
    }
    if (this.components.transactions) {
      this.components.transactions.destroy();
    }
    if (this.components.analytics) {
      this.components.analytics.destroy();
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const app = new App();
  app.init();

  // Make app instance globally available
  window.app = app;
});

// Cleanup on window unload
window.addEventListener("beforeunload", () => {
  if (window.app) {
    window.app.destroy();
  }
});

module.exports = App;
