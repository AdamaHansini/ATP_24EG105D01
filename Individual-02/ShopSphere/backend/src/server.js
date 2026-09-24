// backend/src/server.js
import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';
import { ensurePermanentAccounts } from './scripts/ensurePermanentAccounts.js';
import { getJwtSecret } from './config/jwt.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    getJwtSecret();
    await connectDB();

    // Ensure permanent staff accounts exist in MongoDB (idempotent)
    await ensurePermanentAccounts();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`ShopSphere Backend REST API is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start ShopSphere backend server:', error.name, error.message);
    process.exit(1);
  }
}

startServer();
