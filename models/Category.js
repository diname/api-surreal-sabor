const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class CategoryModel {
  constructor() {
    const dbPath = path.join(__dirname, '../database/surreal_sabor.db');
    this.db = new sqlite3.Database(dbPath);
  }

  getAll() {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM categories ORDER BY name`;
      this.db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  getById(id) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM categories WHERE id = ?`;
      this.db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  create(category) {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO categories (name, description) VALUES (?, ?)`;
      this.db.run(query, [category.name, category.description], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  update(id, category) {
    return new Promise((resolve, reject) => {
      const query = `UPDATE categories SET name = ?, description = ? WHERE id = ?`;
      this.db.run(query, [category.name, category.description, id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      });
    });
  }

  delete(id) {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM categories WHERE id = ?`;
      this.db.run(query, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      });
    });
  }
}

module.exports = CategoryModel;

