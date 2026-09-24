// backend/src/controllers/authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Seller, Store } from '../models/index.js';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set.');
  }
  return secret;
}

// Roles that cannot be created through public registration
const PROTECTED_ROLES = ['admin', 'support', 'delivery'];

function generateToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}


function toPlainUser(user) {
  if (!user) return null;
  const obj = typeof user.toObject === 'function'
    ? user.toObject()
    : (user._doc ? { ...user._doc } : { ...user });
  delete obj.password;
  return obj;
}

export async function register(req, res, next) {
  try {
    const { name, email, password, role = 'customer', storeName } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
        errorCode: 'VALIDATION_ERROR',
      });
    }

    // Block registration of protected staff roles via public API
    if (PROTECTED_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Role '${role}' cannot be registered through this endpoint.`,
        errorCode: 'PROTECTED_ROLE',
      });
    }

    // Only allow customer and seller via registration
    if (!['customer', 'seller'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Only customer or seller accounts can be registered.',
        errorCode: 'INVALID_ROLE',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.',
        errorCode: 'USER_ALREADY_EXISTS',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role,
      addresses: [],
      isSuspended: false,
    });

    if (role === 'seller') {
      const seller = await Seller.create({
        user: user._id,
        storeName: storeName || `${name}'s Store`,
        businessEmail: normalizedEmail,
        status: 'approved',
      });
      await Store.create({
        seller: seller._id,
        name: storeName || `${name}'s Store`,
        description: 'Quality goods directly from authorized seller',
        rating: 4.9,
        status: 'active',
      });
    }

    const token = generateToken(user);
    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

    const userObj = toPlainUser(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { user: userObj, token },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password, role: requestedRole } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
        errorCode: 'VALIDATION_ERROR',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        errorCode: 'INVALID_CREDENTIALS',
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended by administrators.',
        errorCode: 'ACCOUNT_SUSPENDED',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        errorCode: 'INVALID_CREDENTIALS',
      });
    }

    // If the frontend sends an expected role, validate it against the real MongoDB role
    if (requestedRole && requestedRole !== user.role) {
      return res.status(401).json({
        success: false,
        message: `Login failed. This account does not have the '${requestedRole}' role.`,
        errorCode: 'ROLE_MISMATCH',
      });
    }

    const token = generateToken(user);
    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

    const userObj = toPlainUser(user);

    // Attach store details if seller
    if (user.role === 'seller') {
      const seller = await Seller.findOne({ user: user._id });
      if (seller) {
        userObj.seller = seller;
        const store = await Store.findOne({ seller: seller._id });
        if (store) userObj.store = store;
      }
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: { user: userObj, token },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const userObj = toPlainUser(user);

    if (user.role === 'seller') {
      const seller = await Seller.findOne({ user: user._id });
      if (seller) {
        userObj.seller = seller;
        const store = await Store.findOne({ seller: seller._id });
        if (store) userObj.store = store;
      }
    }

    res.json({ success: true, message: 'User profile retrieved', data: { user: userObj } });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res) {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
}
