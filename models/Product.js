const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class ProductModel {
  constructor() {
    const dbPath = path.join(__dirname, '../database/surreal_sabor.db');
    this.db = new sqlite3.Database(dbPath);
  }

  getAll() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT p.*, c.name as category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE p.is_active = 1
        ORDER BY p.created_at DESC
      `;
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
      const query = `
        SELECT p.*, c.name as category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE p.id = ? AND p.is_active = 1
      `;
      this.db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  getByCategory(categoryId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT p.*, c.name as category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE p.category_id = ? AND p.is_active = 1
        ORDER BY p.created_at DESC
      `;
      this.db.all(query, [categoryId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  getFeatured() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT p.*, c.name as category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE p.is_featured = 1 AND p.is_active = 1
        ORDER BY p.created_at DESC
      `;
      this.db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  create(product) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO products (name, description, price, category_id, image_url, is_featured, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      this.db.run(query, [
        product.name,
        product.description,
        product.price,
        product.category_id,
        product.image_url,
        product.is_featured || false,
        product.is_active !== undefined ? product.is_active : true
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  update(id, product) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE products 
        SET name = ?, description = ?, price = ?, category_id = ?, image_url = ?, 
            is_featured = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      this.db.run(query, [
        product.name,
        product.description,
        product.price,
        product.category_id,
        product.image_url,
        product.is_featured,
        product.is_active,
        id
      ], function(err) {
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
      const query = `UPDATE products SET is_active = 0 WHERE id = ?`;
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

module.exports = ProductModel;

