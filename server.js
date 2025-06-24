require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const database = require('./config/database');

// Importar rotas
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const customerRoutes = require('./routes/customers');

const app = express();
const PORT = process.env.PORT || 3001;

// Segurança
app.use(helmet());
app.use(cors({ origin: '*', credentials: true }));

// Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Arquivos estáticos (imagens)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/customers', customerRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    message: 'API Surreal Sabor funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Erros internos
app.use((err, req, res, next) => {
  console.error('Erro no servidor:', err.stack);
  res.status(500).json({ message: 'Erro interno do servidor' });
});

// Rota 404
app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});


// Inicialização
async function startServer() {
  try {
    await database.connect();

    app.listen(PORT, '0.0.0.0', () => {
      console.log('✅ Banco de dados conectado.');
      console.log(`🚀 Servidor rodando em: http://localhost:${PORT}`);
      console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar o servidor:', error.message);
    process.exit(1);
  }
}

startServer();
