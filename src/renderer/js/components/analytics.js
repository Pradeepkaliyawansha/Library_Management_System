const api = require("../services/api");
const { showNotification } = require("../services/notifications");

class Analytics {
  constructor() {
    this.data = {
      transactions: [],
      books: [],
      students: [],
    };
    this.charts = {};
    this.operationInProgress = false;

    this.initElements();
    this.setupEventListeners();
  }

  initElements() {
    // Chart containers
    this.popularBooksChart = document.getElementById("popularBooksChart");
    this.issueTrendsChart = document.getElementById("issueTrendsChart");
    this.categoryDistChart = document.getElementById("categoryDistChart");
    this.studentActivityChart = document.getElementById("studentActivityChart");
    this.overdueChart = document.getElementById("overdueChart");
    this.dailyActivityChart = document.getElementById("dailyActivityChart");

    // Stats containers
    this.totalIssuesEl = document.getElementById("totalIssues");
    this.totalReturnsEl = document.getElementById("totalReturns");
    this.overdueCountEl = document.getElementById("overdueCount");
    this.avgLoanPeriodEl = document.getElementById("avgLoanPeriod");
    this.mostPopularBookEl = document.getElementById("mostPopularBook");
    this.mostActiveStudentEl = document.getElementById("mostActiveStudent");

    // Filter inputs
    this.dateFromFilter = document.getElementById("analyticsDateFrom");
    this.dateToFilter = document.getElementById("analyticsDateTo");
  }

  setupEventListeners() {
    // Make functions globally available
    window.showAnalytics = () => this.show();
    window.hideAnalytics = () => this.hide();
    window.refreshAnalytics = () => this.loadData();
    window.applyAnalyticsFilter = () => this.applyFilters();
    window.resetAnalyticsFilter = () => this.resetFilters();
    window.exportAnalyticsPDF = () => this.exportToPDF();
  }

  async show() {
    const modal = document.getElementById("analyticsModal");
    modal.style.display = "block";
    document.body.classList.add("modal-open");

    await this.loadData();
  }

  hide() {
    const modal = document.getElementById("analyticsModal");
    modal.style.display = "none";
    document.body.classList.remove("modal-open");
  }

  async loadData() {
    if (this.operationInProgress) {
      return;
    }

    this.operationInProgress = true;
    this.showLoading();

    try {
      // Load all necessary data
      const [transactions, books, students] = await Promise.all([
        api.getTransactions(),
        api.getBooks(),
        api.getStudents(),
      ]);

      this.data = {
        transactions,
        books,
        students,
      };

      // Apply filters if any
      this.applyFilters();
    } catch (error) {
      console.error("Error loading analytics data:", error);
      showNotification("Error loading analytics data", "error");
    } finally {
      this.operationInProgress = false;
      this.hideLoading();
    }
  }

  applyFilters() {
    const dateFrom = this.dateFromFilter.value
      ? new Date(this.dateFromFilter.value)
      : null;
    const dateTo = this.dateToFilter.value
      ? new Date(this.dateToFilter.value)
      : null;

    let filteredTransactions = [...this.data.transactions];

    if (dateFrom || dateTo) {
      filteredTransactions = filteredTransactions.filter((t) => {
        const issueDate = new Date(t.issue_date);
        if (dateFrom && issueDate < dateFrom) return false;
        if (dateTo && issueDate > dateTo) return false;
        return true;
      });
    }

    this.processData(filteredTransactions);
    this.renderCharts();
    this.renderStats();
  }

  resetFilters() {
    this.dateFromFilter.value = "";
    this.dateToFilter.value = "";
    this.applyFilters();
  }

  processData(transactions) {
    this.analytics = {
      popularBooks: this.calculatePopularBooks(transactions),
      issueTrends: this.calculateIssueTrends(transactions),
      categoryDistribution: this.calculateCategoryDistribution(transactions),
      studentActivity: this.calculateStudentActivity(transactions),
      overdueStats: this.calculateOverdueStats(transactions),
      dailyActivity: this.calculateDailyActivity(transactions),
      generalStats: this.calculateGeneralStats(transactions),
    };
  }

  calculatePopularBooks(transactions) {
    const bookCounts = {};

    transactions.forEach((t) => {
      const isbn = t.isbn;
      if (!bookCounts[isbn]) {
        const book = this.data.books.find((b) => b.isbn === isbn);
        bookCounts[isbn] = {
          isbn,
          title: book ? book.title : "Unknown",
          author: book ? book.author : "Unknown",
          count: 0,
        };
      }
      bookCounts[isbn].count++;
    });

    return Object.values(bookCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  calculateIssueTrends(transactions) {
    const monthCounts = {};

    transactions.forEach((t) => {
      const date = new Date(t.issue_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      if (!monthCounts[monthKey]) {
        monthCounts[monthKey] = { issued: 0, returned: 0 };
      }

      monthCounts[monthKey].issued++;

      if (t.status === "returned") {
        monthCounts[monthKey].returned++;
      }
    });

    return Object.entries(monthCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, counts]) => ({
        month,
        ...counts,
      }))
      .slice(-12); // Last 12 months
  }

  calculateCategoryDistribution(transactions) {
    const categoryCounts = {};

    transactions.forEach((t) => {
      const book = this.data.books.find((b) => b.isbn === t.isbn);
      const category = book?.category || "Uncategorized";

      if (!categoryCounts[category]) {
        categoryCounts[category] = 0;
      }
      categoryCounts[category]++;
    });

    return Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([category, count]) => ({ category, count }));
  }

  calculateStudentActivity(transactions) {
    const studentCounts = {};

    transactions.forEach((t) => {
      const studentId = t.student_id;
      if (!studentCounts[studentId]) {
        const student = this.data.students.find(
          (s) => s.student_id === studentId,
        );
        studentCounts[studentId] = {
          studentId,
          name: student ? student.name : "Unknown",
          department: student ? student.department : "Unknown",
          count: 0,
        };
      }
      studentCounts[studentId].count++;
    });

    return Object.values(studentCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  calculateOverdueStats(transactions) {
    const now = new Date();
    const overdue = transactions.filter(
      (t) => t.status === "issued" && new Date(t.due_date) < now,
    );

    return {
      count: overdue.length,
      byDuration: {
        "1-7 days": overdue.filter(
          (t) =>
            this.getDaysOverdue(t.due_date) >= 1 &&
            this.getDaysOverdue(t.due_date) <= 7,
        ).length,
        "8-14 days": overdue.filter(
          (t) =>
            this.getDaysOverdue(t.due_date) >= 8 &&
            this.getDaysOverdue(t.due_date) <= 14,
        ).length,
        "15-30 days": overdue.filter(
          (t) =>
            this.getDaysOverdue(t.due_date) >= 15 &&
            this.getDaysOverdue(t.due_date) <= 30,
        ).length,
        "30+ days": overdue.filter((t) => this.getDaysOverdue(t.due_date) > 30)
          .length,
      },
    };
  }

  calculateDailyActivity(transactions) {
    const last30Days = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayTransactions = transactions.filter((t) => {
        const issueDate = new Date(t.issue_date).toISOString().split("T")[0];
        return issueDate === dateStr;
      });

      last30Days.push({
        date: dateStr,
        count: dayTransactions.length,
      });
    }

    return last30Days;
  }

  calculateGeneralStats(transactions) {
    const totalIssues = transactions.length;
    const totalReturns = transactions.filter(
      (t) => t.status === "returned",
    ).length;
    const overdueCount = transactions.filter(
      (t) => t.status === "issued" && new Date(t.due_date) < new Date(),
    ).length;

    // Calculate average loan period
    const returnedTransactions = transactions.filter(
      (t) => t.status === "returned" && t.return_date,
    );
    let avgLoanPeriod = 0;

    if (returnedTransactions.length > 0) {
      const totalDays = returnedTransactions.reduce((sum, t) => {
        const issueDate = new Date(t.issue_date);
        const returnDate = new Date(t.return_date);
        const days = Math.ceil(
          (returnDate - issueDate) / (1000 * 60 * 60 * 24),
        );
        return sum + days;
      }, 0);
      avgLoanPeriod = (totalDays / returnedTransactions.length).toFixed(1);
    }

    // Most popular book
    const popularBooks = this.calculatePopularBooks(transactions);
    const mostPopularBook = popularBooks[0] || {
      title: "N/A",
      count: 0,
    };

    // Most active student
    const studentActivity = this.calculateStudentActivity(transactions);
    const mostActiveStudent = studentActivity[0] || {
      name: "N/A",
      count: 0,
    };

    return {
      totalIssues,
      totalReturns,
      overdueCount,
      avgLoanPeriod,
      mostPopularBook,
      mostActiveStudent,
    };
  }

  getDaysOverdue(dueDate) {
    const now = new Date();
    const due = new Date(dueDate);
    return Math.ceil((now - due) / (1000 * 60 * 60 * 24));
  }

  renderCharts() {
    this.renderPopularBooksChart();
    this.renderIssueTrendsChart();
    this.renderCategoryDistChart();
    this.renderStudentActivityChart();
    this.renderOverdueChart();
    this.renderDailyActivityChart();
  }

  renderPopularBooksChart() {
    const data = this.analytics.popularBooks;
    const maxCount = Math.max(...data.map((d) => d.count));

    this.popularBooksChart.innerHTML = data
      .map((book, index) => {
        const percentage = (book.count / maxCount) * 100;
        return `
        <div class="chart-bar-item">
          <div class="chart-bar-label">
            <span class="chart-rank">#${index + 1}</span>
            <span class="chart-title" title="${this.escapeHtml(book.title)}">${this.truncate(this.escapeHtml(book.title), 30)}</span>
            <span class="chart-count">${book.count}</span>
          </div>
          <div class="chart-bar-container">
            <div class="chart-bar" style="width: ${percentage}%"></div>
          </div>
        </div>
      `;
      })
      .join("");
  }

  renderIssueTrendsChart() {
    const data = this.analytics.issueTrends;
    const maxValue = Math.max(
      ...data.map((d) => Math.max(d.issued, d.returned)),
    );

    this.issueTrendsChart.innerHTML = `
      <div class="line-chart">
        ${data
          .map((d, index) => {
            const issuedHeight = (d.issued / maxValue) * 100;
            const returnedHeight = (d.returned / maxValue) * 100;
            const monthName = this.formatMonth(d.month);

            return `
            <div class="line-chart-item">
              <div class="line-chart-bars">
                <div class="line-chart-bar issued" style="height: ${issuedHeight}%" title="Issued: ${d.issued}"></div>
                <div class="line-chart-bar returned" style="height: ${returnedHeight}%" title="Returned: ${d.returned}"></div>
              </div>
              <div class="line-chart-label">${monthName}</div>
            </div>
          `;
          })
          .join("")}
      </div>
      <div class="chart-legend">
        <div class="legend-item">
          <span class="legend-color issued"></span>
          <span>Issued</span>
        </div>
        <div class="legend-item">
          <span class="legend-color returned"></span>
          <span>Returned</span>
        </div>
      </div>
    `;
  }

  renderCategoryDistChart() {
    const data = this.analytics.categoryDistribution;
    const total = data.reduce((sum, d) => sum + d.count, 0);

    this.categoryDistChart.innerHTML = `
      <div class="pie-chart-container">
        ${data
          .map((d, index) => {
            const percentage = ((d.count / total) * 100).toFixed(1);
            const color = this.getChartColor(index);
            return `
            <div class="pie-chart-item">
              <div class="pie-chart-color" style="background: ${color}"></div>
              <div class="pie-chart-label">
                <span>${this.escapeHtml(d.category)}</span>
                <span class="pie-chart-percentage">${percentage}% (${d.count})</span>
              </div>
            </div>
          `;
          })
          .join("")}
      </div>
    `;
  }

  renderStudentActivityChart() {
    const data = this.analytics.studentActivity;
    const maxCount = Math.max(...data.map((d) => d.count));

    this.studentActivityChart.innerHTML = data
      .map((student, index) => {
        const percentage = (student.count / maxCount) * 100;
        return `
        <div class="chart-bar-item">
          <div class="chart-bar-label">
            <span class="chart-rank">#${index + 1}</span>
            <span class="chart-title" title="${this.escapeHtml(student.name)}">${this.truncate(this.escapeHtml(student.name), 25)}</span>
            <span class="chart-count">${student.count}</span>
          </div>
          <div class="chart-bar-container">
            <div class="chart-bar student" style="width: ${percentage}%"></div>
          </div>
        </div>
      `;
      })
      .join("");
  }

  renderOverdueChart() {
    const data = this.analytics.overdueStats.byDuration;
    const total = Object.values(data).reduce((sum, val) => sum + val, 0);

    if (total === 0) {
      this.overdueChart.innerHTML = `
        <div class="empty-state">
          <p>No overdue books! 🎉</p>
        </div>
      `;
      return;
    }

    const maxValue = Math.max(...Object.values(data));

    this.overdueChart.innerHTML = Object.entries(data)
      .map(([duration, count]) => {
        const percentage = (count / maxValue) * 100;
        return `
        <div class="chart-bar-item">
          <div class="chart-bar-label">
            <span class="chart-title">${duration}</span>
            <span class="chart-count">${count}</span>
          </div>
          <div class="chart-bar-container">
            <div class="chart-bar overdue" style="width: ${percentage}%"></div>
          </div>
        </div>
      `;
      })
      .join("");
  }

  renderDailyActivityChart() {
    const data = this.analytics.dailyActivity;
    const maxCount = Math.max(...data.map((d) => d.count), 1);

    this.dailyActivityChart.innerHTML = `
      <div class="activity-chart">
        ${data
          .map((d) => {
            const height = (d.count / maxCount) * 100;
            const date = new Date(d.date);
            const dayName = date.toLocaleDateString("en-US", {
              weekday: "short",
            });

            return `
            <div class="activity-bar-item" title="${d.date}: ${d.count} issues">
              <div class="activity-bar" style="height: ${height}%"></div>
              <div class="activity-label">${dayName}</div>
            </div>
          `;
          })
          .join("")}
      </div>
    `;
  }

  renderStats() {
    const stats = this.analytics.generalStats;

    this.totalIssuesEl.textContent = stats.totalIssues;
    this.totalReturnsEl.textContent = stats.totalReturns;
    this.overdueCountEl.textContent = stats.overdueCount;
    this.avgLoanPeriodEl.textContent = `${stats.avgLoanPeriod} days`;
    this.mostPopularBookEl.textContent = `${stats.mostPopularBook.title} (${stats.mostPopularBook.count}x)`;
    this.mostActiveStudentEl.textContent = `${stats.mostActiveStudent.name} (${stats.mostActiveStudent.count}x)`;
  }

  getChartColor(index) {
    const colors = [
      "#6366f1",
      "#ec4899",
      "#10b981",
      "#f59e0b",
      "#3b82f6",
      "#8b5cf6",
      "#14b8a6",
      "#f97316",
      "#06b6d4",
      "#a855f7",
    ];
    return colors[index % colors.length];
  }

  formatMonth(monthKey) {
    const [year, month] = monthKey.split("-");
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    });
  }

  truncate(str, length) {
    if (!str) return "";
    if (str.length <= length) return str;
    return str.substring(0, length) + "...";
  }

  escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  showLoading() {
    const content = document.querySelector(".analytics-content");
    if (content) {
      content.classList.add("loading");
    }
  }

  hideLoading() {
    const content = document.querySelector(".analytics-content");
    if (content) {
      content.classList.remove("loading");
    }
  }

  async exportToPDF() {
    showNotification("PDF export feature coming soon!", "info");
  }

  destroy() {
    // Cleanup
    this.charts = {};
  }
}

module.exports = Analytics;
