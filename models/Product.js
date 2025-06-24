const { dbQuery, dbExec } = require('../utils/query');

class ProductModel {
  async getAll() {
    return await dbQuery(`
      SELECT p.*, c.name AS category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.is_active = 1
      ORDER BY p.created_at DESC
    `);
  }

  async getById(id) {
    const rows = await dbQuery(`
      SELECT p.*, c.name AS category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.id = ? AND p.is_active = 1
    `, [id]);
    return rows[0];
  }

  async getByCategory(categoryId) {
    return await dbQuery(`
      SELECT p.*, c.name AS category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.category_id = ? AND p.is_active = 1
      ORDER BY p.created_at DESC
    `, [categoryId]);
  }

  async getFeatured() {
    return await dbQuery(`
      SELECT p.*, c.name AS category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.is_featured = 1 AND p.is_active = 1
      ORDER BY p.created_at DESC
    `);
  }

  async create(product) {
    const result = await dbExec(
      `INSERT INTO products (name, description, price, category_id, image_url, is_featured, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        product.name,
        product.description,
        product.price,
        product.category_id,
        product.image_url,
        product.is_featured || false,
        product.is_active !== undefined ? product.is_active : true
      ]
    );
    return result.insertId;
  }

  async update(id, product) {
    const result = await dbExec(
      `UPDATE products 
       SET name = ?, description = ?, price = ?, category_id = ?, image_url = ?, 
           is_featured = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        product.name,
        product.description,
        product.price,
        product.category_id,
        product.image_url,
        product.is_featured,
        product.is_active,
        id
      ]
    );
    return result.affectedRows;
  }

  async delete(id) {
    const result = await dbExec(
      `UPDATE products SET is_active = 0 WHERE id = ?`,
      [id]
    );
    return result.affectedRows;
  }
}

module.exports = new ProductModel();
