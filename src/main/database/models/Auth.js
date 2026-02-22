const { runQuery, executeQuery } = require("../db");
const crypto = require("crypto");

class Auth {
  // Hash a PIN/password with SHA-256 + salt
  static hashPassword(password, salt) {
    if (!salt) salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto
      .createHmac("sha256", salt)
      .update(password)
      .digest("hex");
    return { hash, salt };
  }

  static verifyPassword(password, hash, salt) {
    const { hash: computed } = Auth.hashPassword(password, salt);
    return computed === hash;
  }

  // Seed default users if none exist
  static seedDefaults() {
    const existing = executeQuery("SELECT COUNT(*) as cnt FROM users");
    if (existing.length > 0 && existing[0].values[0][0] > 0) return;

    const defaults = [
      {
        username: "admin",
        password: "1234",
        role: "ADMIN",
        display_name: "Administrator",
      },
      {
        username: "librarian",
        password: "1234",
        role: "LIBRARIAN",
        display_name: "Librarian",
      },
      {
        username: "viewer",
        password: "1234",
        role: "VIEWER",
        display_name: "Viewer",
      },
    ];

    defaults.forEach(({ username, password, role, display_name }) => {
      const { hash, salt } = Auth.hashPassword(password);
      runQuery(
        `INSERT OR IGNORE INTO users (username, password_hash, salt, role, display_name) VALUES (?, ?, ?, ?, ?)`,
        [username, hash, salt, role, display_name],
      );
    });
  }

  static findByUsername(username) {
    const result = executeQuery(
      "SELECT * FROM users WHERE username = ? AND is_active = 1",
      [username],
    );
    if (!result.length || !result[0].values.length) return null;
    const cols = result[0].columns;
    const vals = result[0].values[0];
    const user = {};
    cols.forEach((c, i) => (user[c] = vals[i]));
    return user;
  }

  static getAllUsers() {
    const result = executeQuery(
      "SELECT id, username, role, display_name, is_active, created_at FROM users ORDER BY created_at ASC",
    );
    if (!result.length) return [];
    const cols = result[0].columns;
    return result[0].values.map((row) => {
      const obj = {};
      cols.forEach((c, i) => (obj[c] = row[i]));
      return obj;
    });
  }

  static createUser(username, password, role, display_name) {
    const { hash, salt } = Auth.hashPassword(password);
    runQuery(
      `INSERT INTO users (username, password_hash, salt, role, display_name) VALUES (?, ?, ?, ?, ?)`,
      [username, hash, salt, role, display_name],
    );
  }

  static updatePassword(userId, newPassword) {
    const { hash, salt } = Auth.hashPassword(newPassword);
    runQuery("UPDATE users SET password_hash = ?, salt = ? WHERE id = ?", [
      hash,
      salt,
      userId,
    ]);
  }

  static updateUser(userId, { display_name, role, is_active }) {
    runQuery(
      "UPDATE users SET display_name = ?, role = ?, is_active = ? WHERE id = ?",
      [display_name, role, is_active ? 1 : 0, userId],
    );
  }

  static deleteUser(userId) {
    runQuery("DELETE FROM users WHERE id = ?", [userId]);
  }

  // Login: returns user object (without hash/salt) or null
  static login(username, password) {
    const user = Auth.findByUsername(username);
    if (!user) return null;
    if (!Auth.verifyPassword(password, user.password_hash, user.salt))
      return null;
    // Return safe user object
    const { password_hash, salt, ...safeUser } = user;
    return safeUser;
  }
}

module.exports = Auth;
