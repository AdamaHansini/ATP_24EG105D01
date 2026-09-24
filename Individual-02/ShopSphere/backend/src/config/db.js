// backend/src/config/db.js
import mongoose from 'mongoose';
import dns from 'dns';

// Force reliable DNS for MongoDB Atlas SRV records
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (_) {}

const CONNECT_OPTIONS = {
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 0,
  heartbeatFrequencyMS: 10000,
  retryWrites: true,
  w: 'majority',
};

export async function connectDB(retries = 5, delayMs = 3000) {
  const uri = process.env.MONGODB_URI;
  if (!uri || !uri.startsWith('mongodb')) {
    console.error('[db] MONGODB_URI is not set or invalid. Set it in backend/.env');
    process.exit(1);
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`[db] Connecting to MongoDB (attempt ${attempt}/${retries})...`);
      await mongoose.connect(uri, CONNECT_OPTIONS);
      console.log('[db] MongoDB connected successfully.');
      return;
    } catch (err) {
      console.error(`[db] Attempt ${attempt} failed: ${err.message}`);
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, delayMs));
      } else {
        throw err;
      }
    }
  }
}

export async function startDbSession() {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('MongoDB is not connected. Cannot start session.');
  }
  return await mongoose.startSession();
}
