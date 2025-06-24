const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const adminModel = require('../models/Admin');

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: 'Usuário e senha são obrigatórios' });

    const admin = await adminModel.getByUsername(username);
    if (!admin || !(await bcrypt.compare(password, admin.password_hash)))
      return res.status(401).json({ message: 'Credenciais inválidas' });

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ message: 'Login realizado com sucesso', token, admin: { id: admin.id, username: admin.username } });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Verificação de token
router.get('/verify', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Token não fornecido' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await adminModel.getById(decoded.id);
    if (!admin) return res.status(401).json({ message: 'Administrador não encontrado' });

    res.json({ valid: true, admin: { id: admin.id, username: admin.username } });
  } catch (err) {
    res.status(401).json({ message: 'Token inválido' });
  }
});

module.exports = router;
