const express = require('express')
const router = express.Router()
const { Cart } = require('../models/Order')
const { v4: uuidv4 } = require('uuid')

// Middleware para gerar session_id se não existir
const ensureSession = (req, res, next) => {
  if (!req.session) {
    req.session = {}
  }

  if (!req.session.cart_id) {
    req.session.cart_id = uuidv4()
  }

  next()
}

// Adicionar item ao carrinho
router.post('/add', ensureSession, (req, res) => {
  const { product_id, quantity = 1 } = req.body
  const sessionId = req.session.cart_id

  if (!product_id) {
    return res.status(400).json({ message: 'Product ID é obrigatório' })
  }

  Cart.addItem(sessionId, product_id, quantity, (err) => {
    if (err) {
      console.error('Erro ao adicionar item ao carrinho:', err)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }

    res.json({ message: 'Item adicionado ao carrinho com sucesso' })
  })
})

// Listar itens do carrinho
router.get('/', ensureSession, (req, res) => {
  const sessionId = req.session.cart_id

  Cart.getItems(sessionId, (err, items) => {
    if (err) {
      console.error('Erro ao buscar itens do carrinho:', err)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }

    // Calcular total
    const total = items.reduce((sum, item) => {
      return sum + item.quantity * item.price
    }, 0)

    res.json({
      items: items,
      total: total,
      count: items.reduce((sum, item) => sum + item.quantity, 0)
    })
  })
})

// Atualizar quantidade de um item
router.put('/update', ensureSession, (req, res) => {
  const { product_id, quantity } = req.body
  const sessionId = req.session.cart_id

  if (!product_id || quantity === undefined) {
    return res
      .status(400)
      .json({ message: 'Product ID e quantidade são obrigatórios' })
  }

  Cart.updateQuantity(sessionId, product_id, quantity, (err) => {
    if (err) {
      console.error('Erro ao atualizar item do carrinho:', err)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }

    res.json({ message: 'Quantidade atualizada com sucesso' })
  })
})

// Remover item do carrinho
router.delete('/remove/:productId', ensureSession, (req, res) => {
  const { productId } = req.params
  const sessionId = req.session.cart_id

  Cart.removeItem(sessionId, productId, (err) => {
    if (err) {
      console.error('Erro ao remover item do carrinho:', err)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }

    res.json({ message: 'Item removido do carrinho com sucesso' })
  })
})

// Limpar carrinho
router.delete('/clear', ensureSession, (req, res) => {
  const sessionId = req.session.cart_id

  Cart.clear(sessionId, (err) => {
    if (err) {
      console.error('Erro ao limpar carrinho:', err)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }

    res.json({ message: 'Carrinho limpo com sucesso' })
  })
})

// Obter total do carrinho
router.get('/total', ensureSession, (req, res) => {
  const sessionId = req.session.cart_id

  Cart.getTotal(sessionId, (err, total) => {
    if (err) {
      console.error('Erro ao calcular total do carrinho:', err)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }

    res.json({ total: total || 0 })
  })
})

module.exports = router
