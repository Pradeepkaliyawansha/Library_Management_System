const { ipcMain } = require("electron");
const Auth = require("../database/models/Auth");

// Login
ipcMain.handle("auth-login", async (event, { username, password }) => {
  try {
    const user = Auth.login(username, password);
    if (!user) {
      return { success: false, error: "Invalid username or password" };
    }
    return { success: true, user };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: error.message };
  }
});

// Get all users (admin only — enforced on renderer side too)
ipcMain.handle("auth-get-users", async () => {
  try {
    return Auth.getAllUsers();
  } catch (error) {
    console.error("Get users error:", error);
    return [];
  }
});

// Create user (admin only)
ipcMain.handle(
  "auth-create-user",
  async (event, { username, password, role, display_name }) => {
    try {
      Auth.createUser(username, password, role, display_name);
      return { success: true };
    } catch (error) {
      console.error("Create user error:", error);
      return { success: false, error: error.message };
    }
  },
);

// Update user (admin only)
ipcMain.handle(
  "auth-update-user",
  async (event, { userId, display_name, role, is_active }) => {
    try {
      Auth.updateUser(userId, { display_name, role, is_active });
      return { success: true };
    } catch (error) {
      console.error("Update user error:", error);
      return { success: false, error: error.message };
    }
  },
);

// Change password
ipcMain.handle(
  "auth-change-password",
  async (event, { userId, newPassword }) => {
    try {
      Auth.updatePassword(userId, newPassword);
      return { success: true };
    } catch (error) {
      console.error("Change password error:", error);
      return { success: false, error: error.message };
    }
  },
);

// Delete user (admin only)
ipcMain.handle("auth-delete-user", async (event, userId) => {
  try {
    Auth.deleteUser(userId);
    return { success: true };
  } catch (error) {
    console.error("Delete user error:", error);
    return { success: false, error: error.message };
  }
});

// Seed defaults (called once on init)
ipcMain.handle("auth-seed-defaults", async () => {
  try {
    Auth.seedDefaults();
    return { success: true };
  } catch (error) {
    console.error("Seed error:", error);
    return { success: false, error: error.message };
  }
});
