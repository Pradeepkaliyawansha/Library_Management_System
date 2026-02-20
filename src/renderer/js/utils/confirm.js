/**
 * confirm.js — Non-blocking confirmation dialog for Electron
 * Drop-in replacement for the native confirm() which freezes the renderer.
 *
 * Usage:
 *   const { showConfirm } = require('./confirm');
 *   const ok = await showConfirm('Are you sure you want to delete this student?');
 *   if (!ok) return;
 */

// Inject styles once
(function injectStyles() {
  if (document.getElementById("confirmDialogStyles")) return;
  const style = document.createElement("style");
  style.id = "confirmDialogStyles";
  style.textContent = `
    #confirmDialogOverlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(6px);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: confirmFadeIn 0.18s ease-out;
    }

    @keyframes confirmFadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    #confirmDialogBox {
      background: var(--color-surface, #1f2937);
      border: 1px solid var(--color-border, rgba(255,255,255,0.12));
      border-radius: 16px;
      padding: 32px 36px 28px;
      min-width: 340px;
      max-width: 460px;
      box-shadow: 0 24px 60px rgba(0,0,0,0.6);
      animation: confirmSlideUp 0.2s ease-out;
      text-align: center;
    }

    @keyframes confirmSlideUp {
      from { opacity: 0; transform: translateY(20px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0)   scale(1);    }
    }

    #confirmDialogIcon {
      font-size: 2.8rem;
      margin-bottom: 16px;
      display: block;
    }

    #confirmDialogMessage {
      font-family: var(--font-body, 'DM Sans', sans-serif);
      font-size: 1rem;
      font-weight: 500;
      color: var(--color-text, #f9fafb);
      line-height: 1.55;
      margin-bottom: 28px;
    }

    #confirmDialogActions {
      display: flex;
      gap: 12px;
      justify-content: center;
    }

    .confirm-btn {
      flex: 1;
      max-width: 160px;
      padding: 10px 20px;
      border: none;
      border-radius: 10px;
      font-family: var(--font-body, 'DM Sans', sans-serif);
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
    }

    .confirm-btn:hover  { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,0.35); }
    .confirm-btn:active { transform: translateY(0);    box-shadow: none; opacity: 0.85; }

    .confirm-btn-cancel {
      background: var(--color-bg-tertiary, #1a1f2e);
      color: var(--color-text-secondary, #9ca3af);
      border: 1.5px solid var(--color-border, rgba(255,255,255,0.12));
    }

    .confirm-btn-danger {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: #fff;
      box-shadow: 0 3px 10px rgba(239,68,68,0.3);
    }

    .confirm-btn-primary {
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      color: #fff;
      box-shadow: 0 3px 10px rgba(99,102,241,0.3);
    }

    /* Light-theme overrides */
    body[data-theme="light"] #confirmDialogBox {
      background: #ffffff;
      border-color: rgba(0,0,0,0.1);
      box-shadow: 0 24px 60px rgba(0,0,0,0.18);
    }

    body[data-theme="light"] .confirm-btn-cancel {
      background: #f1f5f9;
      color: #475569;
      border-color: rgba(0,0,0,0.12);
    }
  `;
  document.head.appendChild(style);
})();

/**
 * Show a non-blocking confirmation dialog.
 *
 * @param {string}  message         - The question to ask the user.
 * @param {object}  [opts]
 * @param {string}  [opts.icon]     - Emoji icon shown above the message. Default: '⚠️'
 * @param {string}  [opts.confirm]  - Label for the confirm button. Default: 'Confirm'
 * @param {string}  [opts.cancel]   - Label for the cancel button. Default: 'Cancel'
 * @param {string}  [opts.variant]  - Button style: 'danger' | 'primary'. Default: 'danger'
 * @returns {Promise<boolean>}       Resolves true if user confirmed, false if cancelled.
 */
function showConfirm(message, opts = {}) {
  const {
    icon = "⚠️",
    confirm = "Confirm",
    cancel = "Cancel",
    variant = "danger",
  } = opts;

  return new Promise((resolve) => {
    // Build overlay
    const overlay = document.createElement("div");
    overlay.id = "confirmDialogOverlay";

    overlay.innerHTML = `
      <div id="confirmDialogBox" role="dialog" aria-modal="true" aria-label="Confirmation">
        <span id="confirmDialogIcon">${icon}</span>
        <p id="confirmDialogMessage">${escapeHtml(message)}</p>
        <div id="confirmDialogActions">
          <button class="confirm-btn confirm-btn-cancel" id="confirmCancelBtn">${escapeHtml(cancel)}</button>
          <button class="confirm-btn confirm-btn-${variant}" id="confirmOkBtn">${escapeHtml(confirm)}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Focus the confirm button for keyboard users
    requestAnimationFrame(() => {
      document.getElementById("confirmOkBtn")?.focus();
    });

    function cleanup(result) {
      overlay.remove();
      resolve(result);
    }

    document
      .getElementById("confirmOkBtn")
      .addEventListener("click", () => cleanup(true));
    document
      .getElementById("confirmCancelBtn")
      .addEventListener("click", () => cleanup(false));

    // Click outside = cancel
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) cleanup(false);
    });

    // Keyboard: Enter = confirm, Escape = cancel
    function onKeyDown(e) {
      if (e.key === "Escape") {
        document.removeEventListener("keydown", onKeyDown);
        cleanup(false);
      }
      if (e.key === "Enter") {
        document.removeEventListener("keydown", onKeyDown);
        cleanup(true);
      }
    }
    document.addEventListener("keydown", onKeyDown);
  });
}

function escapeHtml(str) {
  if (!str) return "";
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

module.exports = { showConfirm };
