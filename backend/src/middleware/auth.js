const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: { code: 'NO_TOKEN', message: 'No token provided' } });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findOne({ _id: decoded.id });

    if (!user) {
      return res.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'User not found' } });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: { code: 'AUTH_ERROR', message: 'Please authenticate' } });
  }
};

const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: { 
        code: 'FORBIDDEN', 
        message: 'Admin access required' 
      } 
    });
  }
  next();
};

module.exports = { auth, adminAuth };
