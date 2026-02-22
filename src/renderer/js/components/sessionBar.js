const authService = require("../services/auth");
const path = require("path");

class SessionBar {
  constructor() {
    this.el = null;
    this._observer = null; // MutationObserver for theme changes
  }

  /**
   * Build and inject the bar. Call once after authService.init().
   * Requires sessionBar.css to be linked in index.html.
   */
  mount() {
    if (this.el) return;

    this.el = document.createElement("div");
    this.el.id = "sessionBar";
    this.el.innerHTML = this._template();

    document.body.prepend(this.el);

    // Push main content below the bar
    const container = document.querySelector(".container");
    if (container) container.style.paddingTop = "52px";

    // Expose authService globally (needed for other components)
    window.authService = authService;

    this._bindEvents();
    this._watchTheme();
  }

  /** Remove bar and clean up. */
  unmount() {
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
    if (this.el) {
      this.el.remove();
      this.el = null;
    }
    const container = document.querySelector(".container");
    if (container) container.style.paddingTop = "";
  }

  // ── Private ────────────────────────────────────────────────────────

  _template() {
    const role = authService.role;
    const displayName = this._esc(authService.displayName);
    const isDark = this._isDark();
    const themeIcon = isDark ? "☀️" : "🌙";
    const themeLabel = isDark ? "Light" : "Dark";

    const usersBtn = authService.isAdmin
      ? `<button class="sb-btn sb-btn-users" id="sbUsersBtn" title="Manage Users">
           👥 <span>Users</span>
         </button>`
      : "";

    return `
      <!-- Left: branding -->
      <div class="sb-brand">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
        Library Management System
      </div>

      <!-- Right: user info + actions -->
      <div class="sb-actions">
        <span class="sb-label">Logged in as</span>
        <span class="sb-username">${displayName}</span>
        <span class="sb-role-badge ${role}">${role}</span>

        <div class="sb-divider"></div>

        ${usersBtn}

        <button class="sb-btn sb-btn-logout" id="sbLogoutBtn" title="Logout">
          ⏻ <span>Logout</span>
        </button>
      </div>
    `;
  }

  _bindEvents() {
    // Logout
    this.el
      .querySelector("#sbLogoutBtn")
      ?.addEventListener("click", () => authService.logout());

    // Users panel (admin only)
    this.el
      .querySelector("#sbUsersBtn")
      ?.addEventListener("click", () => window.userManager?.show());
  }

  /** Watch for data-theme changes on <html> so the button icon stays in sync
   *  even if theme is toggled from elsewhere (e.g. the main toolbar). */
  _watchTheme() {
    this._observer = new MutationObserver(() => this._syncThemeButton());
    this._observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
  }

  _syncThemeButton() {
    const iconEl = document.getElementById("sbThemeIcon");
    const labelEl = document.getElementById("sbThemeLabel");
    if (!iconEl || !labelEl) return;
    const isDark = this._isDark();
    iconEl.textContent = isDark ? "☀️" : "🌙";
    labelEl.textContent = isDark ? "Light" : "Dark";
  }

  _isDark() {
    return document.documentElement.getAttribute("data-theme") !== "light";
  }

  _esc(str) {
    if (!str) return "";
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }
}

module.exports = new SessionBar();
