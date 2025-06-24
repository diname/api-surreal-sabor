const jwt = require('jsonwebtoken');
const customerModel = require('../models/Customer');

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

module.exports = customerAuth;
