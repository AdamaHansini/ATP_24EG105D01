// backend/src/scripts/ensurePermanentAccounts.js
// Ensures the three permanent staff accounts exist in MongoDB with correct roles
// and bcrypt-hashed passwords. Idempotent — safe to call repeatedly.
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import { User } from '../models/index.js';

// Ensure .env is loaded if script is executed directly
dotenv.config();

const PERMANENT_ACCOUNTS = [
  {
    email: process.env.ADMIN_EMAIL || 'admin@gmail.com',
    password: process.env.ADMIN_PASSWORD || 'admin',
    name: 'Admin',
    role: 'admin',
  },
  {
    email: process.env.SUPPORT_EMAIL || 'support@gmail.com',
    password: process.env.SUPPORT_PASSWORD || 'support',
    name: 'Support',
    role: 'support',
  },
  {
    email: process.env.DELIVERY_EMAIL || 'delivery@gmail.com',
    password: process.env.DELIVERY_PASSWORD || 'delivery',
    name: 'Delivery',
    role: 'delivery',
  },
];

export async function ensurePermanentAccounts() {
  console.log('[accounts] Checking permanent staff accounts...');

  for (const account of PERMANENT_ACCOUNTS) {
    const normalizedEmail = account.email.toLowerCase().trim();

    try {
      const existing = await User.findOne({ email: normalizedEmail });

      if (!existing) {
        // Account does not exist — create it with a hashed password
        const hashedPassword = await bcrypt.hash(account.password, 12);
        await User.create({
          name: account.name,
          email: normalizedEmail,
          password: hashedPassword,
          role: account.role,
          addresses: [],
          isSuspended: false,
        });
        console.log(`[accounts] Created permanent account: ${normalizedEmail} (${account.role})`);
      } else {
        let needsUpdate = false;
        const updates = {};

        // 1. Ensure correct role
        if (existing.role !== account.role) {
          updates.role = account.role;
          needsUpdate = true;
          console.log(`[accounts] Correcting role for ${normalizedEmail}: ${existing.role} -> ${account.role}`);
        }

        // 2. Ensure password hash matches configured credentials
        const passwordMatches = await bcrypt.compare(account.password, existing.password).catch(() => false);
        if (!passwordMatches) {
          updates.password = await bcrypt.hash(account.password, 12);
          needsUpdate = true;
          console.log(`[accounts] Synchronizing password hash for ${normalizedEmail}`);
        }

        if (needsUpdate) {
          await User.findByIdAndUpdate(existing._id, { $set: updates });
          console.log(`[accounts] Updated ${normalizedEmail}`);
        } else {
          console.log(`[accounts] Account verified: ${normalizedEmail} (${account.role})`);
        }
      }
    } catch (err) {
      console.error(`[accounts] Error processing ${normalizedEmail}:`, err.message);
    }
  }

  console.log('[accounts] Permanent staff account check complete.');
}

// Support direct CLI execution: node src/scripts/ensurePermanentAccounts.js
const currentFilePath = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(currentFilePath)) {
  (async () => {
    try {
      await connectDB();
      await ensurePermanentAccounts();
      await mongoose.disconnect();
      console.log('[accounts] Script completed successfully.');
      process.exit(0);
    } catch (error) {
      console.error('[accounts] Execution failed:', error);
      process.exit(1);
    }
  })();
}
