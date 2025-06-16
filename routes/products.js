const express = require('express');
const ProductModel = require('../models/Product');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const productModel = new ProductModel();

// Listar todos os produtos (público)
router.get('/', async (req, res) => {
  try {
    const products = await productModel.getAll();
    res.json(products);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Buscar produto por ID (público)
router.get('/:id', async (req, res) => {
  try {
    const product = await productModel.getById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    res.json(product);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Listar produtos por categoria (público)
router.get('/category/:categoryId', async (req, res) => {
  try {
    const products = await productModel.getByCategory(req.params.categoryId);
    res.json(products);
  } catch (error) {
    console.error('Erro ao buscar produtos por categoria:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Listar produtos em destaque (público)
router.get('/featured/list', async (req, res) => {
  try {
    const products = await productModel.getFeatured();
    res.json(products);
  } catch (error) {
    console.error('Erro ao buscar produtos em destaque:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Criar novo produto (admin)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description, price, category_id, image_url, is_featured } = req.body;

    if (!name || !price || !category_id) {
      return res.status(400).json({ message: 'Nome, preço e categoria são obrigatórios' });
    }

    const productId = await productModel.create({
      name,
      description,
      price,
      category_id,
      image_url,
      is_featured: is_featured || false
    });

    const newProduct = await productModel.getById(productId);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar produto (admin)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, description, price, category_id, image_url, is_featured, is_active } = req.body;

    if (!name || !price || !category_id) {
      return res.status(400).json({ message: 'Nome, preço e categoria são obrigatórios' });
    }

    const changes = await productModel.update(req.params.id, {
      name,
      description,
      price,
      category_id,
      image_url,
      is_featured,
      is_active
    });

    if (changes === 0) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    const updatedProduct = await productModel.getById(req.params.id);
    res.json(updatedProduct);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Deletar produto (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const changes = await productModel.delete(req.params.id);
    if (changes === 0) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    res.json({ message: 'Produto removido com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;

