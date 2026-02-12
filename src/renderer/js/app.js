const { ipcRenderer } = require("electron");
const api = require("./services/api");
const { showNotification } = require("./services/notifications");
const { initTheme } = require("./utils/theme");
const Dashboard = require("./components/dashboard");
const Students = require("./components/students");
const Books = require("./components/books");
const Transactions = require("./components/transactions");

class App {
  constructor() {
    this.currentTab = "dashboard";
    this.components = {
      dashboard: null,
      students: null,
      books: null,
      transactions: null,
    };
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
      // Load all data in parallel
      await Promise.all([
        this.loadStatistics(),
        this.components.students.loadData(),
        this.components.books.loadData(),
        this.components.transactions.loadData(),
      ]);

      // Update dashboard
      this.components.dashboard.update(
        this.components.students.data,
        this.components.books.data,
      );

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
    }
  }

  updateStatisticsDisplay(stats) {
    document.getElementById("totalStudents").textContent = stats.totalStudents;
    document.getElementById("totalBooks").textContent = stats.totalBooks;
    document.getElementById("availableCopies").textContent =
      stats.availableCopies;
    document.getElementById("issuedBooks").textContent = stats.issuedBooks;
  }

  showTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll(".tab-content");
    const buttons = document.querySelectorAll(".tab-button");

    tabs.forEach((tab) => tab.classList.remove("active"));
    buttons.forEach((btn) => btn.classList.remove("active"));

    // Show selected tab
    document.getElementById(tabName).classList.add("active");

    const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeButton) {
      activeButton.classList.add("active");
    }

    this.currentTab = tabName;
  }

  async refreshData() {
    await this.loadInitialData();
  }
}

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const app = new App();
  app.init();

  // Make app instance globally available
  window.app = app;
});

module.exports = App;
