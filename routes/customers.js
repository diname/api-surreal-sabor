const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const customerModel = require('../models/Customer');
const router = express.Router();

// Middleware de autenticação
const customerAuth = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Token requerido' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const customer = await customerModel.getById(decoded.id);
    if (!customer) return res.status(401).json({ message: 'Cliente não encontrado' });

    req.customer = customer;
    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido' });
  }
};

// Cadastro de novo cliente
router.post('/', async (req, res) => {
  try {
    const { full_name, email, password, phone, address } = req.body;
    if (!full_name || !email || !password)
      return res.status(400).json({ message: 'Nome, email e senha são obrigatórios' });

    const existingCustomer = await customerModel.getByEmail(email);
    if (existingCustomer)
      return res.status(400).json({ message: 'Email já cadastrado' });

    const password_hash = await bcrypt.hash(password, 10);
    const customerId = await customerModel.create({ full_name, email, phone, address, password_hash });
    const newCustomer = await customerModel.getById(customerId);

    const token = jwt.sign(
      { id: newCustomer.id, email: newCustomer.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Cliente cadastrado com sucesso',
      customer: newCustomer,
      token
    });
  } catch (error) {
    console.error('Erro ao cadastrar cliente:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Login de cliente
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });

    const customer = await customerModel.getByEmail(email);
    if (!customer || !customer.password_hash)
      return res.status(404).json({ message: 'Cliente não encontrado' });

    const passwordMatch = await bcrypt.compare(password, customer.password_hash);
    if (!passwordMatch)
      return res.status(401).json({ message: 'Senha incorreta' });

    const token = jwt.sign(
      { id: customer.id, email: customer.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ message: 'Login realizado com sucesso', customer, token });
  } catch (error) {
    console.error('Erro no login do cliente:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Verificação de token
router.get('/verify', customerAuth, async (req, res) => {
  res.json({ valid: true, customer: req.customer });
});

// Obter todos os clientes
router.get('/', customerAuth, async (req, res) => {
  try {
    const customers = await customerModel.getAll();
    res.json(customers);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Obter cliente por ID
router.get('/:id', customerAuth, async (req, res) => {
  try {
    const customer = await customerModel.getById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Cliente não encontrado' });
    res.json(customer);
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar cliente
router.put('/:id', customerAuth, async (req, res) => {
  try {
    const { full_name, email, phone, address } = req.body;
    if (!full_name || !email)
      return res.status(400).json({ message: 'Nome completo e email são obrigatórios' });

    const changes = await customerModel.update(req.params.id, { full_name, email, phone, address });
    if (changes === 0) return res.status(404).json({ message: 'Cliente não encontrado' });

    const updatedCustomer = await customerModel.getById(req.params.id);
    res.json(updatedCustomer);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Deletar cliente
router.delete('/:id', customerAuth, async (req, res) => {
  try {
    const changes = await customerModel.delete(req.params.id);
    if (changes === 0) return res.status(404).json({ message: 'Cliente não encontrado' });
    res.json({ message: 'Cliente removido com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;
