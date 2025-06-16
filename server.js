require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const Database = require('./config/database');

// Importar rotas
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const customerRoutes = require('./routes/customers');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares de segurança
app.use(helmet());
app.use(cors({
  origin: '*', // Permitir todas as origens para desenvolvimento
  credentials: true
}));

// Middlewares de parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (imagens)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/customers', customerRoutes);

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'API Surreal Sabor funcionando!', 
    timestamp: new Date().toISOString() 
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Algo deu errado!' });
});

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

// Inicializar banco de dados e servidor
async function startServer() {
  try {
    const database = new Database();
    await database.connect();
    await database.initTables();
    await database.seedData();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`API disponível em: http://localhost:${PORT}/api`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Erro ao inicializar o servidor:', error);
    process.exit(1);
  }
}

startServer();

