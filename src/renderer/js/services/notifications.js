const NOTIFICATION_DURATION = 3000; // milliseconds

const notificationStyles = {
  success: {
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    icon: "✓",
  },
  error: {
    gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    icon: "✕",
  },
  info: {
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    icon: "ℹ",
  },
  warning: {
    gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    icon: "⚠",
  },
};

function showNotification(message, type = "success") {
  // Remove existing notification
  const existingNotif = document.getElementById("customNotification");
  if (existingNotif) {
    existingNotif.remove();
  }

  // Create notification element
  const notification = document.createElement("div");
  notification.id = "customNotification";

  const style = notificationStyles[type] || notificationStyles.info;

  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${style.gradient};
    color: white;
    padding: 15px 25px 15px 20px;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    z-index: 10001;
    font-weight: 600;
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    gap: 12px;
    animation: slideInRight 0.3s ease-out, fadeOut 0.3s ease-in 2.7s forwards;
    max-width: 400px;
  `;

  notification.innerHTML = `
    <span style="font-size: 1.5rem;">${style.icon}</span>
    <span>${message}</span>
  `;

  document.body.appendChild(notification);

  // Auto-remove after duration
  setTimeout(() => {
    if (notification && notification.parentNode) {
      notification.remove();
    }
  }, NOTIFICATION_DURATION);
}

// Add CSS animations if not already present
function initNotificationStyles() {
  if (!document.getElementById("notificationStyles")) {
    const style = document.createElement("style");
    style.id = "notificationStyles";
    style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes fadeOut {
        from {
          opacity: 1;
        }
        to {
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

// Initialize on load
initNotificationStyles();

module.exports = { showNotification };
