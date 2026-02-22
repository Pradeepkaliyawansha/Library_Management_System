// src/renderer/js/components/userManager.js
// Admin-only panel to manage system users

const { ipcRenderer } = require("electron");
const { showNotification } = require("../services/notifications");
const { showConfirm } = require("../utils/confirm");

class UserManager {
  constructor(authService) {
    this.auth = authService;
    this.users = [];
    this.editingUser = null;
  }

  // Render the user management modal HTML (injected once into DOM)
  injectModal() {
    if (document.getElementById("userMgmtModal")) return;

    const modal = document.createElement("div");
    modal.id = "userMgmtModal";
    modal.className = "modal";
    modal.style.display = "none";
    modal.innerHTML = `
      <div class="modal-backdrop" onclick="window.userManager.hide()"></div>
      <div class="modal-content" style="max-width:700px;width:95%;padding:0;overflow:hidden;">
        <!-- Header -->
        <div style="
          padding: var(--space-6) var(--space-8);
          background: var(--gradient-primary);
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
        ">
          <h2 style="margin:0;font-family:var(--font-display);font-size:var(--font-size-2xl);display:flex;align-items:center;gap:var(--space-3);">
            👥 User Management
          </h2>
          <button onclick="window.userManager.hide()" style="
            background:rgba(255,255,255,0.2);border:none;color:white;
            width:36px;height:36px;border-radius:var(--radius-md);
            cursor:pointer;font-size:var(--font-size-lg);
            display:flex;align-items:center;justify-content:center;
          ">✕</button>
        </div>

        <div style="padding:var(--space-6) var(--space-8);background:var(--color-bg-secondary);">

          <!-- Create user form -->
          <div style="
            background:var(--color-surface);
            border:1px solid var(--color-border);
            border-radius:var(--radius-xl);
            padding:var(--space-6);
            margin-bottom:var(--space-6);
          ">
            <h3 style="font-family:var(--font-display);font-size:var(--font-size-lg);margin-bottom:var(--space-4);color:var(--color-text);">
              ➕ Create New User
            </h3>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);margin-bottom:var(--space-3);">
              <input type="text" id="newUsername" placeholder="Username *" class="form-input-um" />
              <input type="text" id="newDisplayName" placeholder="Display Name *" class="form-input-um" />
              <input type="password" id="newPassword" placeholder="Password / PIN *" class="form-input-um" />
              <select id="newRole" class="form-input-um">
                <option value="VIEWER">VIEWER</option>
                <option value="LIBRARIAN">LIBRARIAN</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <button onclick="window.userManager.createUser()" class="btn btn-primary" style="width:100%;">
              Create User
            </button>
          </div>

          <!-- Users table -->
          <div style="
            background:var(--color-surface);
            border:1px solid var(--color-border);
            border-radius:var(--radius-xl);
            overflow:hidden;
          ">
            <table style="width:100%;border-collapse:collapse;font-size:var(--font-size-sm);">
              <thead>
                <tr style="background:var(--gradient-primary);">
                  <th style="padding:var(--space-3) var(--space-4);text-align:left;color:white;font-weight:700;">Username</th>
                  <th style="padding:var(--space-3) var(--space-4);text-align:left;color:white;font-weight:700;">Display Name</th>
                  <th style="padding:var(--space-3) var(--space-4);text-align:left;color:white;font-weight:700;">Role</th>
                  <th style="padding:var(--space-3) var(--space-4);text-align:left;color:white;font-weight:700;">Status</th>
                  <th style="padding:var(--space-3) var(--space-4);text-align:left;color:white;font-weight:700;">Actions</th>
                </tr>
              </thead>
              <tbody id="usersTableBody">
                <tr><td colspan="5" style="text-align:center;padding:var(--space-6);color:var(--color-text-muted);">Loading...</td></tr>
              </tbody>
            </table>
          </div>

        </div>
      </div>
    `;

    // Inject inline styles for the form inputs
    if (!document.getElementById("umStyles")) {
      const s = document.createElement("style");
      s.id = "umStyles";
      s.textContent = `
        .form-input-um {
          width:100%;
          padding: 10px 14px;
          background: var(--color-bg-tertiary);
          border: 1.5px solid var(--color-border);
          border-radius: var(--radius-md);
          font-size: var(--font-size-sm);
          font-family: var(--font-body);
          color: var(--color-text);
          outline: none;
          transition: border-color 0.2s;
        }
        .form-input-um:focus { border-color: var(--color-primary); }
      `;
      document.head.appendChild(s);
    }

    document.body.appendChild(modal);
  }

  async show() {
    this.injectModal();
    document.getElementById("userMgmtModal").style.display = "flex";
    document.body.classList.add("modal-open");
    await this.loadUsers();
  }

  hide() {
    const m = document.getElementById("userMgmtModal");
    if (m) m.style.display = "none";
    document.body.classList.remove("modal-open");
  }

  async loadUsers() {
    this.users = await ipcRenderer.invoke("auth-get-users");
    this.renderTable();
  }

  renderTable() {
    const tbody = document.getElementById("usersTableBody");
    if (!tbody) return;

    if (!this.users.length) {
      tbody.innerHTML =
        '<tr><td colspan="5" style="text-align:center;padding:var(--space-6);">No users found</td></tr>';
      return;
    }

    const roleBadge = (role) => {
      const colors = {
        ADMIN: "background:rgba(239,68,68,0.15);color:#f87171;",
        LIBRARIAN: "background:rgba(99,102,241,0.15);color:#818cf8;",
        VIEWER: "background:rgba(16,185,129,0.12);color:#34d399;",
      };
      return `<span style="${colors[role] || ""}padding:2px 8px;border-radius:4px;font-size:0.7rem;font-weight:700;text-transform:uppercase;">${role}</span>`;
    };

    tbody.innerHTML = this.users
      .map(
        (u) => `
      <tr style="border-bottom:1px solid var(--color-border);">
        <td style="padding:var(--space-3) var(--space-4);font-weight:600;color:var(--color-text);">${this._esc(u.username)}</td>
        <td style="padding:var(--space-3) var(--space-4);color:var(--color-text-secondary);">${this._esc(u.display_name)}</td>
        <td style="padding:var(--space-3) var(--space-4);">${roleBadge(u.role)}</td>
        <td style="padding:var(--space-3) var(--space-4);">
          <span style="${u.is_active ? "color:var(--color-success)" : "color:var(--color-danger)"}">
            ${u.is_active ? "● Active" : "○ Inactive"}
          </span>
        </td>
        <td style="padding:var(--space-3) var(--space-4);">
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <button onclick="window.userManager.promptChangePassword(${u.id},'${this._esc(u.username)}')"
              class="btn-small btn-primary" style="font-size:0.7rem;padding:4px 8px;">
              🔑 Password
            </button>
            <button onclick="window.userManager.toggleActive(${u.id},${u.is_active},'${this._esc(u.display_name)}','${u.role}')"
              class="btn-small ${u.is_active ? "btn-warning" : "btn-success"}" style="font-size:0.7rem;padding:4px 8px;">
              ${u.is_active ? "⏸ Disable" : "▶ Enable"}
            </button>
            <button onclick="window.userManager.deleteUser(${u.id},'${this._esc(u.username)}')"
              class="btn-small btn-danger" style="font-size:0.7rem;padding:4px 8px;">
              🗑
            </button>
          </div>
        </td>
      </tr>
    `,
      )
      .join("");
  }

  async createUser() {
    const username = document.getElementById("newUsername").value.trim();
    const display_name = document.getElementById("newDisplayName").value.trim();
    const password = document.getElementById("newPassword").value;
    const role = document.getElementById("newRole").value;

    if (!username || !display_name || !password) {
      showNotification("All fields are required", "warning");
      return;
    }

    const result = await ipcRenderer.invoke("auth-create-user", {
      username,
      password,
      role,
      display_name,
    });
    if (result.success) {
      showNotification("User created!", "success");
      document.getElementById("newUsername").value = "";
      document.getElementById("newDisplayName").value = "";
      document.getElementById("newPassword").value = "";
      await this.loadUsers();
    } else {
      showNotification(`Error: ${result.error}`, "error");
    }
  }

  async promptChangePassword(userId, username) {
    // Simple prompt via a small inline modal
    const newPass = prompt(`Set new password / PIN for "${username}":`);
    if (!newPass) return;

    const result = await ipcRenderer.invoke("auth-change-password", {
      userId,
      newPassword: newPass,
    });
    if (result.success) {
      showNotification("Password updated!", "success");
    } else {
      showNotification(`Error: ${result.error}`, "error");
    }
  }

  async toggleActive(userId, currentlyActive, display_name, role) {
    const result = await ipcRenderer.invoke("auth-update-user", {
      userId,
      display_name,
      role,
      is_active: !currentlyActive,
    });
    if (result.success) {
      showNotification(
        `User ${currentlyActive ? "disabled" : "enabled"}!`,
        "success",
      );
      await this.loadUsers();
    } else {
      showNotification(`Error: ${result.error}`, "error");
    }
  }

  async deleteUser(userId, username) {
    const ok = await showConfirm(
      `Delete user "${username}"? This cannot be undone.`,
      {
        icon: "👤",
        confirm: "Delete User",
        variant: "danger",
      },
    );
    if (!ok) return;

    const result = await ipcRenderer.invoke("auth-delete-user", userId);
    if (result.success) {
      showNotification("User deleted!", "success");
      await this.loadUsers();
    } else {
      showNotification(`Error: ${result.error}`, "error");
    }
  }

  _esc(str) {
    if (!str) return "";
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }
}

module.exports = UserManager;
