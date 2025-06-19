const sqlite3 = require('sqlite3').verbose()
const path = require('path')

const dbPath = path.join(__dirname, '../database/surreal_sabor.db')
const db = new sqlite3.Database(dbPath)

// Criar tabela de pedidos
const createOrdersTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      order_number TEXT UNIQUE NOT NULL,
      total_amount DECIMAL(10,2) NOT NULL,
      status TEXT DEFAULT 'pending',
      payment_method TEXT,
      payment_status TEXT DEFAULT 'pending',
      payment_id TEXT,
      pix_qr_code TEXT,
      boleto_url TEXT,
      boleto_barcode TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
  `

  db.run(sql, (err) => {
    if (err) {
      console.error('Erro ao criar tabela orders:', err)
    } else {
      console.log('Tabela orders criada com sucesso')
    }
  })
}

// Criar tabela de itens do pedido
const createOrderItemsTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price DECIMAL(10,2) NOT NULL,
      total_price DECIMAL(10,2) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `

  db.run(sql, (err) => {
    if (err) {
      console.error('Erro ao criar tabela order_items:', err)
    } else {
      console.log('Tabela order_items criada com sucesso')
    }
  })
}

// Criar tabela de carrinho (sessão)
const createCartTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `

  db.run(sql, (err) => {
    if (err) {
      console.error('Erro ao criar tabela cart_items:', err)
    } else {
      console.log('Tabela cart_items criada com sucesso')
    }
  })
}

// Atualizar tabela customers com campos obrigatórios
const updateCustomersTable = () => {
  // Verificar se as colunas já existem
  db.all('PRAGMA table_info(customers)', (err, columns) => {
    if (err) {
      console.error('Erro ao verificar estrutura da tabela customers:', err)
      return
    }

    const columnNames = columns.map((col) => col.name)

    // Adicionar coluna phone se não existir
    if (!columnNames.includes('phone')) {
      db.run('ALTER TABLE customers ADD COLUMN phone TEXT', (err) => {
        if (err) {
          console.error('Erro ao adicionar coluna phone:', err)
        } else {
          console.log('Coluna phone adicionada com sucesso')
        }
      })
    }

    // Adicionar coluna address se não existir
    if (!columnNames.includes('address')) {
      db.run('ALTER TABLE customers ADD COLUMN address TEXT', (err) => {
        if (err) {
          console.error('Erro ao adicionar coluna address:', err)
        } else {
          console.log('Coluna address adicionada com sucesso')
        }
      })
    }
  })
}

// Modelo de Pedido
class Order {
  static create(orderData, callback) {
    const { customer_id, total_amount, payment_method, items } = orderData

    // Gerar número do pedido único
    const orderNumber = 'SS' + Date.now() + Math.floor(Math.random() * 1000)

    const sql = `
      INSERT INTO orders (customer_id, order_number, total_amount, payment_method)
      VALUES (?, ?, ?, ?)
    `

    db.run(
      sql,
      [customer_id, orderNumber, total_amount, payment_method],
      function (err) {
        if (err) {
          return callback(err)
        }

        const orderId = this.lastID

        // Inserir itens do pedido
        const insertItems = items.map((item) => {
          return new Promise((resolve, reject) => {
            const itemSql = `
            INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
            VALUES (?, ?, ?, ?, ?)
          `

            const totalPrice = item.quantity * item.unit_price

            db.run(
              itemSql,
              [
                orderId,
                item.product_id,
                item.quantity,
                item.unit_price,
                totalPrice
              ],
              (err) => {
                if (err) reject(err)
                else resolve()
              }
            )
          })
        })

        Promise.all(insertItems)
          .then(() => {
            callback(null, { id: orderId, order_number: orderNumber })
          })
          .catch(callback)
      }
    )
  }

  static findById(id, callback) {
    const sql = `
      SELECT o.*, c.full_name, c.email, c.phone, c.address
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      WHERE o.id = ?
    `

    db.get(sql, [id], (err, order) => {
      if (err) return callback(err)
      if (!order) return callback(null, null)

      // Buscar itens do pedido
      const itemsSql = `
        SELECT oi.*, p.name as product_name, p.image_url
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `

      db.all(itemsSql, [id], (err, items) => {
        if (err) return callback(err)

        order.items = items
        callback(null, order)
      })
    })
  }

  static findByCustomer(customerId, callback) {
    const sql = `
      SELECT * FROM orders
      WHERE customer_id = ?
      ORDER BY created_at DESC
    `

    db.all(sql, [customerId], callback)
  }

  static findAll(callback) {
    const sql = `
      SELECT o.*, c.full_name, c.email
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      ORDER BY o.created_at DESC
    `

    db.all(sql, callback)
  }

  static updateStatus(id, status, callback) {
    const sql = `
      UPDATE orders 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `

    db.run(sql, [status, id], callback)
  }

  static updatePayment(id, paymentData, callback) {
    const {
      payment_status,
      payment_id,
      pix_qr_code,
      boleto_url,
      boleto_barcode
    } = paymentData

    const sql = `
      UPDATE orders 
      SET payment_status = ?, payment_id = ?, pix_qr_code = ?, boleto_url = ?, boleto_barcode = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `

    db.run(
      sql,
      [payment_status, payment_id, pix_qr_code, boleto_url, boleto_barcode, id],
      callback
    )
  }
}

// Modelo de Carrinho
class Cart {
  static addItem(sessionId, productId, quantity, callback) {
    // Verificar se item já existe no carrinho
    const checkSql =
      'SELECT * FROM cart_items WHERE session_id = ? AND product_id = ?'

    db.get(checkSql, [sessionId, productId], (err, existingItem) => {
      if (err) return callback(err)

      if (existingItem) {
        // Atualizar quantidade
        const updateSql = `
          UPDATE cart_items 
          SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP
          WHERE session_id = ? AND product_id = ?
        `

        db.run(updateSql, [quantity, sessionId, productId], callback)
      } else {
        // Inserir novo item
        const insertSql = `
          INSERT INTO cart_items (session_id, product_id, quantity)
          VALUES (?, ?, ?)
        `

        db.run(insertSql, [sessionId, productId, quantity], callback)
      }
    })
  }

  static updateQuantity(sessionId, productId, quantity, callback) {
    if (quantity <= 0) {
      return Cart.removeItem(sessionId, productId, callback)
    }

    const sql = `
      UPDATE cart_items 
      SET quantity = ?, updated_at = CURRENT_TIMESTAMP
      WHERE session_id = ? AND product_id = ?
    `

    db.run(sql, [quantity, sessionId, productId], callback)
  }

  static removeItem(sessionId, productId, callback) {
    const sql = 'DELETE FROM cart_items WHERE session_id = ? AND product_id = ?'
    db.run(sql, [sessionId, productId], callback)
  }

  static getItems(sessionId, callback) {
    const sql = `
      SELECT ci.*, p.name, p.price, p.image_url, p.description
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.session_id = ?
      ORDER BY ci.created_at DESC
    `

    db.all(sql, [sessionId], callback)
  }

  static clear(sessionId, callback) {
    const sql = 'DELETE FROM cart_items WHERE session_id = ?'
    db.run(sql, [sessionId], callback)
  }

  static getTotal(sessionId, callback) {
    const sql = `
      SELECT SUM(ci.quantity * p.price) as total
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.session_id = ?
    `

    db.get(sql, [sessionId], (err, result) => {
      if (err) return callback(err)
      callback(null, result.total || 0)
    })
  }
}

// Inicializar tabelas
const initializeTables = () => {
  createOrdersTable()
  createOrderItemsTable()
  createCartTable()
  updateCustomersTable()
}

module.exports = {
  Order,
  Cart,
  initializeTables,
  db
}
