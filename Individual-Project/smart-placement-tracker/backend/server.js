import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';

// Load env vars
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Allowed origins: local dev + Vercel production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://smart-placement-tracker-two.vercel.app',
];

// CORS — set headers on EVERY response (including error paths)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowed =
    !origin ||
    allowedOrigins.includes(origin) ||
    /^https:\/\/smart-placement-tracker.*\.vercel\.app$/.test(origin);

  if (allowed && origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  // Answer preflight immediately
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/applications', applicationRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: ' Smart Placement Tracker API is running' });
});

// Error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});
