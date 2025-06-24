const db = require('../config/database');

async function dbQuery(sql, params = []) {
  const pool = db.getPool();
  const [rows] = await pool.execute(sql, params);
  return rows;
}

async function dbExec(sql, params = []) {
  const pool = db.getPool();
  const [result] = await pool.execute(sql, params);
  return result;
}

module.exports = { dbQuery, dbExec };
