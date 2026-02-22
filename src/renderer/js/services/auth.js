const { ipcRenderer } = require("electron");

// Mirrors the PERMISSIONS from constants.js — now actually enforced
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
    CAN_MANAGE_USERS: true,
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
    CAN_MANAGE_USERS: false,
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
    CAN_MANAGE_USERS: false,
  },
};

// Maps data-perm attributes → button CSS selectors used in dynamically
// rendered table rows (students.js, books.js, transactions.js)
const DYNAMIC_BUTTON_MAP = {
  // Students table buttons rendered by students.js
  CAN_EDIT_STUDENT: [
    '.btn-small.btn-primary[onclick*="edit"]',
    'button.btn-primary[onclick*="editStudent"]',
  ],
  CAN_DELETE_STUDENT: [
    '.btn-small.btn-danger[onclick*="delete"]',
    'button.btn-danger[onclick*="deleteStudent"]',
  ],
  // Books table
  CAN_ISSUE_BOOK: [
    '.btn-small.btn-success[onclick*="Issue"]',
    'button.btn-success[onclick*="showIssueBook"]',
  ],
  CAN_EDIT_BOOK: [
    '.btn-small.btn-primary[onclick*="edit"]',
    'button.btn-primary[onclick*="editBook"]',
  ],
  CAN_DELETE_BOOK: [
    '.btn-small.btn-danger[onclick*="delete"]',
    'button.btn-danger[onclick*="deleteBook"]',
  ],
  // Transactions table
  CAN_RETURN_BOOK: [".btn-small.btn-warning.return-btn"],
  // Delete transaction — only admins; re-uses danger class
};

class AuthService {
  constructor() {
    this.user = null;
    this.permissions = null;
    this._observer = null; // MutationObserver for dynamic rows
  }

  // ── Init ──────────────────────────────────────────────────────────────────

  init() {
    const raw = sessionStorage.getItem("lms_user");
    if (!raw) {
      window.location.href = "login.html";
      return false;
    }
    try {
      this.user = JSON.parse(raw);
      this.permissions = PERMISSIONS[this.user.role] || PERMISSIONS.VIEWER;
      return true;
    } catch {
      window.location.href = "login.html";
      return false;
    }
  }

  // ── Permission helpers ─────────────────────────────────────────────────────

  can(permission) {
    if (!this.permissions) return false;
    return this.permissions[permission] === true;
  }

  get isAdmin() {
    return this.user?.role === "ADMIN";
  }
  get isLibrarian() {
    return this.user?.role === "LIBRARIAN";
  }
  get isViewer() {
    return this.user?.role === "VIEWER";
  }
  get displayName() {
    return this.user?.display_name || this.user?.username || "User";
  }
  get role() {
    return this.user?.role || "VIEWER";
  }

  // ── Logout ─────────────────────────────────────────────────────────────────

  logout() {
    // Disconnect observer before navigating away
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
    sessionStorage.removeItem("lms_user");
    window.location.href = "login.html";
  }

  // ── Role UI ────────────────────────────────────────────────────────────────

  applyRoleUI() {
    this._applyStaticPermissions();
    this._applyDynamicPermissions();

    if (this.isViewer) {
      this._injectViewerBanner();
    }

    // Watch for table re-renders and re-apply permissions on new rows
    this._startObserver();
  }

  // Hide/show elements with data-perm attributes (static HTML elements).
  //
  // IMPORTANT: we only ever *hide* denied elements. We never force-show
  // permitted ones — that would override elements that are intentionally
  // hidden by the app (e.g. forms with style="display:none" that are
  // toggled open by the user via Add Student / Add Book buttons).
  //
  // Two approaches are used together:
  //   1. Elements marked data-perm-always (e.g. toolbar buttons) are
  //      shown/hidden regardless of their current state.
  //   2. All other data-perm elements are only hidden when denied —
  //      if permitted we leave their display state completely untouched.
  _applyStaticPermissions() {
    document.querySelectorAll("[data-perm]").forEach((el) => {
      const perm = el.getAttribute("data-perm");
      const allowed = this.can(perm);

      if (!allowed) {
        // Denied: always hide
        el.style.display = "none";
      } else if (el.hasAttribute("data-perm-show")) {
        // Permitted + explicitly flagged to be made visible (toolbar buttons etc.)
        el.style.display = "";
      }
      // Permitted but no data-perm-show → leave display untouched
    });
  }

  // Hide dynamically rendered table buttons (created by JS components)
  _applyDynamicPermissions() {
    const p = this.permissions;

    // ── Students table ─────────────────────────────────────────────
    // "Edit" buttons (btn-primary in students table)
    document
      .querySelectorAll("#studentsTableBody .btn-small.btn-primary")
      .forEach((btn) => {
        btn.style.display = p.CAN_EDIT_STUDENT ? "" : "none";
      });
    // "Delete" buttons (btn-danger in students table)
    document
      .querySelectorAll("#studentsTableBody .btn-small.btn-danger")
      .forEach((btn) => {
        btn.style.display = p.CAN_DELETE_STUDENT ? "" : "none";
      });
    // "Books" info buttons are always visible (read-only)

    // ── Books table ────────────────────────────────────────────────
    // "Issue" buttons
    document
      .querySelectorAll("#booksTableBody .btn-small.btn-success")
      .forEach((btn) => {
        btn.style.display = p.CAN_ISSUE_BOOK ? "" : "none";
      });
    // "Edit" buttons
    document
      .querySelectorAll("#booksTableBody .btn-small.btn-primary")
      .forEach((btn) => {
        btn.style.display = p.CAN_EDIT_BOOK ? "" : "none";
      });
    // "Delete" buttons
    document
      .querySelectorAll("#booksTableBody .btn-small.btn-danger")
      .forEach((btn) => {
        btn.style.display = p.CAN_DELETE_BOOK ? "" : "none";
      });

    // ── Transactions table ─────────────────────────────────────────
    // "Return" buttons
    document
      .querySelectorAll("#transactionsTableBody .btn-small.return-btn")
      .forEach((btn) => {
        btn.style.display = p.CAN_RETURN_BOOK ? "" : "none";
      });
    // "Delete" transaction buttons — admin only (reuse btn-danger in transactions)
    document
      .querySelectorAll("#transactionsTableBody .btn-small.delete-btn")
      .forEach((btn) => {
        btn.style.display = p.CAN_DELETE_STUDENT ? "" : "none"; // admin-only proxy
      });
  }

  // MutationObserver: re-applies dynamic permissions whenever table bodies change
  _startObserver() {
    if (this._observer) return; // already running

    const targets = [
      document.getElementById("studentsTableBody"),
      document.getElementById("booksTableBody"),
      document.getElementById("transactionsTableBody"),
    ].filter(Boolean);

    if (!targets.length) return;

    this._observer = new MutationObserver(() => {
      this._applyDynamicPermissions();
    });

    targets.forEach((target) => {
      this._observer.observe(target, { childList: true, subtree: false });
    });
  }

  // Viewer-mode read-only banner (shown once at the top of the page)
  _injectViewerBanner() {
    if (document.getElementById("viewerBanner")) return;

    const banner = document.createElement("div");
    banner.id = "viewerBanner";
    banner.style.cssText = `
      position: fixed;
      bottom: 16px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.35);
      color: #fbbf24;
      padding: 8px 20px;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
      font-family: var(--font-body, 'DM Sans', sans-serif);
      letter-spacing: 0.04em;
      z-index: 9000;
      display: flex;
      align-items: center;
      gap: 8px;
      backdrop-filter: blur(8px);
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      pointer-events: none;
    `;
    banner.innerHTML = `<span>👁️</span> Read-Only Mode — You are logged in as Viewer`;
    document.body.appendChild(banner);
  }
}

// Singleton
const authService = new AuthService();
module.exports = authService;
