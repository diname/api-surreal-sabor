const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

class Database {
  constructor() {
    this.db = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      const dbPath = path.join(__dirname, '../database/surreal_sabor.db');
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Erro ao conectar com o banco de dados:', err.message);
          reject(err);
        } else {
          console.log('Conectado ao banco de dados SQLite.');
          resolve();
        }
      });
    });
  }

  async initTables() {
    return new Promise((resolve, reject) => {
      const queries = [
        // Tabela de categorias
        `CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        // Tabela de produtos
        `CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          price DECIMAL(10,2) NOT NULL,
          category_id INTEGER,
          image_url TEXT,
          is_featured BOOLEAN DEFAULT FALSE,
          is_active BOOLEAN DEFAULT TRUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (category_id) REFERENCES categories (id)
        )`,
        
        // Tabela de clientes
        `CREATE TABLE IF NOT EXISTS customers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          full_name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          phone TEXT,
          address TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        // Tabela de administradores
        `CREATE TABLE IF NOT EXISTS admins (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
      ];

      let completed = 0;
      const total = queries.length;

      queries.forEach((query) => {
        this.db.run(query, (err) => {
          if (err) {
            console.error('Erro ao criar tabela:', err.message);
            reject(err);
            return;
          }
          completed++;
          if (completed === total) {
            console.log('Todas as tabelas foram criadas com sucesso.');
            resolve();
          }
        });
      });
    });
  }

  async seedData() {
    return new Promise(async (resolve, reject) => {
      try {
        // Inserir categorias padrão
        const categories = [
          { name: 'Caldos e Sopas', description: 'Caldos, sopas e cremes caseiros' },
          { name: 'Refeições Completas', description: 'Pratos principais e refeições completas' },
          { name: 'Bebidas', description: 'Sucos, refrigerantes e águas' },
          { name: 'Sobremesas', description: 'Doces e sobremesas caseiras' }
        ];

        for (const category of categories) {
          await this.insertCategory(category);
        }

        // Inserir produtos padrão
        const products = [
          {
            name: 'Caldo Verde Tradicional',
            description: 'Nosso clássico Caldo Verde, preparado com couve fresca, linguiça defumada de alta qualidade e batatas selecionadas. Uma receita reconfortante que aquece a alma e o corpo.',
            price: 22.50,
            category_id: 1,
            image_url: '/uploads/caldo_verde.png',
            is_featured: true
          },
          {
            name: 'Canjinha da Vovó',
            description: 'A autêntica Canjinha da Vovó, feita com arroz, frango desfiado, cenoura e temperos naturais. Um prato nutritivo e de fácil digestão.',
            price: 21.90,
            category_id: 1,
            image_url: '/uploads/canjinha.png',
            is_featured: false
          },
          {
            name: 'Creme de Mandioquinha com Manjericão',
            description: 'Um creme aveludado de mandioquinha, realçado pelo frescor do manjericão. Uma opção sofisticada e deliciosa.',
            price: 23.00,
            category_id: 1,
            image_url: '/uploads/creme_mandioquinha.png',
            is_featured: false
          },
          {
            name: 'Sopa Minestrone Mediterrânea',
            description: 'Nossa versão da clássica Sopa Minestrone, repleta de legumes frescos, feijão branco e massa, cozidos em um caldo rico e saboroso.',
            price: 24.00,
            category_id: 1,
            image_url: '/uploads/sopa_minestrone.png',
            is_featured: false
          },
          {
            name: 'Strogonoff de Frango Cremoso',
            description: 'O Strogonoff de Frango mais cremoso que você já provou! Pedaços suculentos de frango em um molho rico com champignon.',
            price: 62.00,
            category_id: 2,
            image_url: '/uploads/strogonoff_frango.png',
            is_featured: true
          },
          {
            name: 'Escondidinho de Carne Seca com Queijo Coalho',
            description: 'Uma explosão de sabores nordestinos em um só prato! Carne seca desfiada e bem temperada, coberta por um purê cremoso de mandioca.',
            price: 58.00,
            category_id: 2,
            image_url: '/uploads/escondidinho_carne_seca.png',
            is_featured: false
          },
          {
            name: 'Lasanha à Bolonhesa Artesanal',
            description: 'Nossa Lasanha à Bolonhesa é feita com camadas de massa fresca, um molho bolonhesa encorpado e queijo mussarela derretido.',
            price: 55.00,
            category_id: 2,
            image_url: '/uploads/lasanha_bolonhesa.png',
            is_featured: false
          },
          {
            name: 'Suco Natural de Laranja (1 Litro)',
            description: 'Suco 100% natural de laranja, fresco e delicioso. Perfeito para acompanhar qualquer refeição.',
            price: 8.50,
            category_id: 3,
            image_url: '/uploads/suco_laranja.png',
            is_featured: false
          },
          {
            name: 'Refrigerante Cola Original (350ml)',
            description: 'O sabor clássico e inconfundível do refrigerante cola, na medida certa para matar a sua sede.',
            price: 5.50,
            category_id: 3,
            image_url: '/uploads/refrigerante_cola.png',
            is_featured: false
          },
          {
            name: 'Água Mineral com Gás (500ml)',
            description: 'Água mineral naturalmente gaseificada, ideal para quem busca uma opção refrescante e saudável.',
            price: 4.00,
            category_id: 3,
            image_url: '/uploads/agua_mineral.png',
            is_featured: false
          },
          {
            name: 'Pudim de Leite Condensado Caseiro',
            description: 'O tradicional pudim de leite condensado, com aquela calda de caramelo irresistível. Uma sobremesa clássica.',
            price: 18.00,
            category_id: 4,
            image_url: '/uploads/pudim_leite_condensado.png',
            is_featured: false
          },
          {
            name: 'Bolo de Cenoura com Cobertura de Chocolate',
            description: 'Um bolo de cenoura fofinho e úmido, coberto com uma generosa camada de chocolate cremoso.',
            price: 25.00,
            category_id: 4,
            image_url: '/uploads/bolo_cenoura.png',
            is_featured: true
          }
        ];

        for (const product of products) {
          await this.insertProduct(product);
        }

        // Inserir administrador padrão
        const adminPassword = await bcrypt.hash('admin123', 10);
        await this.insertAdmin({
          username: 'admin',
          password_hash: adminPassword
        });

        console.log('Dados iniciais inseridos com sucesso.');
        resolve();
      } catch (error) {
        console.error('Erro ao inserir dados iniciais:', error);
        reject(error);
      }
    });
  }

  insertCategory(category) {
    return new Promise((resolve, reject) => {
      const query = `INSERT OR IGNORE INTO categories (name, description) VALUES (?, ?)`;
      this.db.run(query, [category.name, category.description], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  insertProduct(product) {
    return new Promise((resolve, reject) => {
      const query = `INSERT OR IGNORE INTO products (name, description, price, category_id, image_url, is_featured, is_active) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`;
      this.db.run(query, [
        product.name,
        product.description,
        product.price,
        product.category_id,
        product.image_url,
        product.is_featured,
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

  insertAdmin(admin) {
    return new Promise((resolve, reject) => {
      const query = `INSERT OR IGNORE INTO admins (username, password_hash) VALUES (?, ?)`;
      this.db.run(query, [admin.username, admin.password_hash], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  close() {
    return new Promise((resolve) => {
      this.db.close((err) => {
        if (err) {
          console.error('Erro ao fechar o banco de dados:', err.message);
        } else {
          console.log('Conexão com o banco de dados fechada.');
        }
        resolve();
      });
    });
  }
}

module.exports = Database;

