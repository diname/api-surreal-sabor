const { dbQuery, dbExec } = require('../utils/query');

class CustomerModel {
  async getAll() {
    return await dbQuery(`SELECT id, full_name, email, phone, address, created_at FROM customers ORDER BY created_at DESC`);
  }

  async getById(id) {
    const rows = await dbQuery(`SELECT id, full_name, email, phone, address, created_at FROM customers WHERE id = ?`, [id]);
    return rows[0];
  }

  async getByEmail(email) {
    const rows = await dbQuery(`SELECT * FROM customers WHERE email = ?`, [email]);
    return rows[0]; 
  }

  async create(customer) {
    const result = await dbExec(
      `INSERT INTO customers (full_name, email, phone, address, password_hash) VALUES (?, ?, ?, ?, ?)`,
      [customer.full_name, customer.email, customer.phone, customer.address, customer.password_hash]
    );
    return result.insertId;
  }

  async update(id, customer) {
    const result = await dbExec(
      `UPDATE customers SET full_name = ?, email = ?, phone = ?, address = ? WHERE id = ?`,
      [customer.full_name, customer.email, customer.phone, customer.address, id]
    );
    return result.affectedRows;
  }

  async delete(id) {
    const result = await dbExec(`DELETE FROM customers WHERE id = ?`, [id]);
    return result.affectedRows;
  }
}

module.exports = new CustomerModel();
