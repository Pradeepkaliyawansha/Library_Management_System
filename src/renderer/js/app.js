const { ipcRenderer } = require("electron");
const api = require("./services/api");
const authService = require("./services/auth");
const sessionBar = require("./components/sessionBar");
const { showNotification } = require("./services/notifications");
const { initTheme, toggleTheme } = require("./utils/theme");
const Dashboard = require("./components/dashboard");
const Students = require("./components/students");
const Books = require("./components/books");
const Transactions = require("./components/transactions");
const Analytics = require("./components/analytics");
const UserManager = require("./components/userManager");

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
    // ── Auth guard ─────────────────────────────────────────────────
    if (!authService.init()) return; // redirects to login.html if no session

    // ── Theme ──────────────────────────────────────────────────────
    initTheme();

    // Expose toggleTheme globally so sessionBar theme button can call it
    window.toggleTheme = toggleTheme;

    // ── Session bar (standalone component + separate CSS) ──────────
    sessionBar.mount();

    // ── Initialize components ──────────────────────────────────────
    this.components.dashboard = new Dashboard();
    this.components.students = new Students();
    this.components.books = new Books();
    this.components.transactions = new Transactions();
    this.components.analytics = new Analytics();

    // User manager (admin only)
    this.userManager = new UserManager(authService);
    window.userManager = this.userManager;

    // ── Apply role-based UI ────────────────────────────────────────
    setTimeout(() => authService.applyRoleUI(), 100);

    // ── Event listeners ────────────────────────────────────────────
    this.setupEventListeners();

    // ── Load data ──────────────────────────────────────────────────
    await this.loadInitialData();

    console.log(
      `App initialized — logged in as ${authService.displayName} (${authService.role})`,
    );
  }

  setupEventListeners() {
    window.showTab = (tabName) => this.showTab(tabName);

    ipcRenderer.on("export-students", () => {
      this.components.students.exportToExcel();
    });
    ipcRenderer.on("export-books", () => {
      this.components.books.exportToExcel();
    });
    ipcRenderer.on("export-transactions", () => {
      this.components.transactions.exportToExcel();
    });
    ipcRenderer.on("update-downloading", () => {
      showNotification("Downloading update...", "info");
    });
    ipcRenderer.on("update-progress", (event, progressObj) => {
      const percent = Math.round(progressObj.percent);
      showNotification(`Downloading update: ${percent}%`, "info");
    });
  }

  async loadInitialData() {
    try {
      await this.loadStatistics();

      const results = await Promise.allSettled([
        this.components.students.loadData(),
        this.components.books.loadData(),
        this.components.transactions.loadData(),
      ]);

      results.forEach((result, index) => {
        if (result.status === "rejected") {
          const names = ["students", "books", "transactions"];
          console.error(`Failed to load ${names[index]}:`, result.reason);
        }
      });

      if (this.components.students.data && this.components.books.data) {
        this.components.dashboard.update(
          this.components.students.data,
          this.components.books.data,
        );
      }

      setTimeout(() => authService.applyRoleUI(), 300);
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
      const el = document.getElementById(id);
      if (el) {
        const current = parseInt(el.textContent) || 0;
        if (current !== value) this.animateValue(el, current, value, 300);
      }
    };
    updateElement("totalStudents", stats.totalStudents);
    updateElement("totalBooks", stats.totalBooks);
    updateElement("availableCopies", stats.availableCopies);
    updateElement("issuedBooks", stats.issuedBooks);
  }

  animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
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
    document
      .querySelectorAll(".tab-content")
      .forEach((t) => t.classList.remove("active"));
    document
      .querySelectorAll(".tab-button")
      .forEach((b) => b.classList.remove("active"));

    document.getElementById(tabName)?.classList.add("active");
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add("active");

    this.currentTab = tabName;
    setTimeout(() => authService.applyRoleUI(), 100);
  }

  async refreshData() {
    if (this.isLoading) return;
    this.isLoading = true;
    try {
      await this.loadInitialData();
    } finally {
      this.isLoading = false;
    }
  }

  destroy() {
    sessionBar.unmount();
    if (this.components.students) this.components.students.destroy();
    if (this.components.books) this.components.books.destroy();
    if (this.components.transactions) this.components.transactions.destroy();
    if (this.components.analytics) this.components.analytics.destroy();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const app = new App();
  app.init();
  window.app = app;
});

window.addEventListener("beforeunload", () => {
  if (window.app) window.app.destroy();
});

module.exports = App;
