// backend/src/app.js
import express from 'express';
import cors from 'cors';

// Routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import sellerRoutes from './routes/sellerRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import deliveryRoutes from './routes/deliveryRoutes.js';

// Middleware
import { errorHandler } from './middleware/errorMiddleware.js';

const app = express();

// Standard middlewares
const allowedOrigins = [
  'http://localhost:5173',
  'https://shopsphere-chi-virid.vercel.app',
  'https://shopsphere-2hjy3wq2k-adamahansinis-projects.vercel.app',
  ...(process.env.FRONTEND_URL || '').split(',').map((origin) => origin.trim()),
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Guest-Id'],
};
// The cors middleware answers OPTIONS preflight requests before API routes.
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    project: 'ShopSphere',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount API endpoints
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/delivery', deliveryRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API route not found', errorCode: 'ROUTE_NOT_FOUND' });
});

// Centralized error handler
app.use(errorHandler);

export default app;
