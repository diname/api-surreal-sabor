const express = require('express');
const CategoryModel = require('../models/Category');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const categoryModel = new CategoryModel();

// Listar todas as categorias (público)
router.get('/', async (req, res) => {
  try {
    const categories = await categoryModel.getAll();
    res.json(categories);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Buscar categoria por ID (público)
router.get('/:id', async (req, res) => {
  try {
    const category = await categoryModel.getById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Categoria não encontrada' });
    }
    res.json(category);
  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Criar nova categoria (admin)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Nome da categoria é obrigatório' });
    }

    const categoryId = await categoryModel.create({ name, description });
    const newCategory = await categoryModel.getById(categoryId);
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar categoria (admin)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Nome da categoria é obrigatório' });
    }

    const changes = await categoryModel.update(req.params.id, { name, description });
    if (changes === 0) {
      return res.status(404).json({ message: 'Categoria não encontrada' });
    }

    const updatedCategory = await categoryModel.getById(req.params.id);
    res.json(updatedCategory);
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Deletar categoria (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const changes = await categoryModel.delete(req.params.id);
    if (changes === 0) {
      return res.status(404).json({ message: 'Categoria não encontrada' });
    }
    res.json({ message: 'Categoria removida com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar categoria:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;

