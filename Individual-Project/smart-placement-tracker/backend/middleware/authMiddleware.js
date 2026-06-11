import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes — verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Restrict to TPO role only
const tpoOnly = (req, res, next) => {
  if (req.user && req.user.role === 'tpo') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: TPO only' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: admin only' });
  }
};

export { protect, tpoOnly, adminOnly };
