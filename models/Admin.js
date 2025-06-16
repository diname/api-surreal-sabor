const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class AdminModel {
  constructor() {
    const dbPath = path.join(__dirname, '../database/surreal_sabor.db');
    this.db = new sqlite3.Database(dbPath);
  }

  getByUsername(username) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM admins WHERE username = ?`;
      this.db.get(query, [username], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  getById(id) {
    return new Promise((resolve, reject) => {
      const query = `SELECT id, username, created_at FROM admins WHERE id = ?`;
      this.db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  create(admin) {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO admins (username, password_hash) VALUES (?, ?)`;
      this.db.run(query, [admin.username, admin.password_hash], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }
}

module.exports = AdminModel;

