// backend/src/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { getJwtSecret } from '../config/jwt.js';


export async function authenticateToken(req, res, next) {
  let token = null;

  // 1. Authorization header: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token required. Please log in.',
      errorCode: 'AUTH_TOKEN_MISSING',
    });
  }

  let decoded;
  const secret = getJwtSecret();
  try {
    decoded = jwt.verify(token, secret);
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
      errorCode: 'INVALID_TOKEN',
    });
  }

  try {
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User associated with token no longer exists.',
        errorCode: 'USER_NOT_FOUND',
      });
    }
    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended by platform administrators.',
        errorCode: 'ACCOUNT_SUSPENDED',
      });
    }
    req.user = user;
    next();
  } catch (err) {
    return next(err);
  }
}

/**
 * Optional Authentication:
 * Extracts user if token is present, but doesn't block unauthenticated guests.
 */
export async function optionalAuth(req, res, next) {
  let token = null;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    const user = await User.findById(decoded.id);
    if (user?.isSuspended) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended by administrators.', errorCode: 'ACCOUNT_SUSPENDED' });
    }
    if (user) req.user = user;
  } catch (e) {
    if (e.name === 'JsonWebTokenError' || e.name === 'TokenExpiredError') return next();
    return next(e);
  }
  next();
}
