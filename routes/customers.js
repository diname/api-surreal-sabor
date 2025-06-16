const express = require('express');
const CustomerModel = require('../models/Customer');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const customerModel = new CustomerModel();

// Listar todos os clientes (admin)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const customers = await customerModel.getAll();
    res.json(customers);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Buscar cliente por ID (admin)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const customer = await customerModel.getById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }
    res.json(customer);
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Cadastrar novo cliente (público)
router.post('/', async (req, res) => {
  try {
    const { full_name, email, phone, address } = req.body;

    if (!full_name || !email) {
      return res.status(400).json({ message: 'Nome completo e email são obrigatórios' });
    }

    // Verificar se o email já existe
    const existingCustomer = await customerModel.getByEmail(email);
    if (existingCustomer) {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }

    const customerId = await customerModel.create({
      full_name,
      email,
      phone,
      address
    });

    const newCustomer = await customerModel.getById(customerId);
    res.status(201).json({
      message: 'Cliente cadastrado com sucesso',
      customer: newCustomer
    });
  } catch (error) {
    console.error('Erro ao cadastrar cliente:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar cliente (admin)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { full_name, email, phone, address } = req.body;

    if (!full_name || !email) {
      return res.status(400).json({ message: 'Nome completo e email são obrigatórios' });
    }

    const changes = await customerModel.update(req.params.id, {
      full_name,
      email,
      phone,
      address
    });

    if (changes === 0) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    const updatedCustomer = await customerModel.getById(req.params.id);
    res.json(updatedCustomer);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Deletar cliente (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const changes = await customerModel.delete(req.params.id);
    if (changes === 0) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }
    res.json({ message: 'Cliente removido com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;

