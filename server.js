require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const session = require('express-session')
const path = require('path')
const Database = require('./config/database')

// Importar modelos e inicializar tabelas
const { initializeTables } = require('./models/Order')

// Importar rotas
const authRoutes = require('./routes/auth')
const productRoutes = require('./routes/products')
const categoryRoutes = require('./routes/categories')
const customerRoutes = require('./routes/customers')
const cartRoutes = require('./routes/cart')
const orderRoutes = require('./routes/orders')

const app = express()
const PORT = process.env.PORT || 3001

// Middlewares de segurança
app.use(helmet())
app.use(
  cors({
    origin: '*', // Permitir todas as origens para desenvolvimento
    credentials: true
  })
)

// Configurar sessões
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'surreal_sabor_session_secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // false para desenvolvimento
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
  })
)

// Middlewares de parsing
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Servir arquivos estáticos (imagens)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Rotas da API
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/customers', customerRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({
    message: 'API Surreal Sabor funcionando!',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    features: ['cart', 'orders', 'payments']
  })
})

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Algo deu errado!' })
})

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' })
})

// Inicializar banco de dados e servidor
async function startServer() {
  try {
    const database = new Database()
    await database.connect()
    await database.initTables()
    await database.seedData()

    // Inicializar novas tabelas para carrinho e pedidos
    initializeTables()

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`)
      console.log(`📱 API disponível em: http://localhost:${PORT}/api`)
      console.log(`🔍 Health check: http://localhost:${PORT}/api/health`)
      console.log(`🛒 Carrinho: http://localhost:${PORT}/api/cart`)
      console.log(`📦 Pedidos: http://localhost:${PORT}/api/orders`)
    })
  } catch (error) {
    console.error('Erro ao inicializar o servidor:', error)
    process.exit(1)
  }
}

startServer()
