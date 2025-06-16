const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class CustomerModel {
  constructor() {
    const dbPath = path.join(__dirname, '../database/surreal_sabor.db');
    this.db = new sqlite3.Database(dbPath);
  }

  getAll() {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM customers ORDER BY created_at DESC`;
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
      const query = `SELECT * FROM customers WHERE id = ?`;
      this.db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  getByEmail(email) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM customers WHERE email = ?`;
      this.db.get(query, [email], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  create(customer) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO customers (full_name, email, phone, address) 
        VALUES (?, ?, ?, ?)
      `;
      this.db.run(query, [
        customer.full_name,
        customer.email,
        customer.phone,
        customer.address
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  update(id, customer) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE customers 
        SET full_name = ?, email = ?, phone = ?, address = ? 
        WHERE id = ?
      `;
      this.db.run(query, [
        customer.full_name,
        customer.email,
        customer.phone,
        customer.address,
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
      const query = `DELETE FROM customers WHERE id = ?`;
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

module.exports = CustomerModel;

