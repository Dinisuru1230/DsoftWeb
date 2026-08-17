const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'malmalee_creations_super_secret_jwt_key_2026');
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, role: true, address: true, phone: true, city: true, district: true, postalCode: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User account not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Admin authorization required.' });
  }
}

module.exports = { authenticateToken, requireAdmin };
