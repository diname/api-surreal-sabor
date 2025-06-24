const { dbQuery, dbExec } = require('../utils/query');

class CategoryModel {
  async getAll() {
    return await dbQuery(`SELECT * FROM categories ORDER BY name`);
  }

  async getById(id) {
    const rows = await dbQuery(`SELECT * FROM categories WHERE id = ?`, [id]);
    return rows[0];
  }

  async create(category) {
    const result = await dbExec(
      `INSERT INTO categories (name, description) VALUES (?, ?)`,
      [category.name, category.description]
    );
    return result.insertId;
  }

  async update(id, category) {
    const result = await dbExec(
      `UPDATE categories SET name = ?, description = ? WHERE id = ?`,
      [category.name, category.description, id]
    );
    return result.affectedRows;
  }

  async delete(id) {
    const result = await dbExec(`DELETE FROM categories WHERE id = ?`, [id]);
    return result.affectedRows;
  }
}

module.exports = new CategoryModel();
