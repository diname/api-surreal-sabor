const { dbQuery, dbExec } = require('../utils/query');

class AdminModel {
  async getByUsername(username) {
    const rows = await dbQuery(`SELECT * FROM admins WHERE username = ?`, [username]);
    return rows[0];
  }

  async getById(id) {
    const rows = await dbQuery(`SELECT id, username, created_at FROM admins WHERE id = ?`, [id]);
    return rows[0];
  }

  async create(admin) {
    const result = await dbExec(
      `INSERT INTO admins (username, password_hash) VALUES (?, ?)`,
      [admin.username, admin.password_hash]
    );
    return result.insertId;
  }
}

module.exports = new AdminModel();
