import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import { User } from '../models/index.js';

const currentFilePath = fileURLToPath(import.meta.url);
dotenv.config({ path: path.resolve(path.dirname(currentFilePath), '../../.env') });

const PERMANENT_ACCOUNTS = [
  { email: 'admin@gmail.com', password: process.env.ADMIN_PASSWORD, name: 'Admin', role: 'admin' },
  { email: 'support@gmail.com', password: process.env.SUPPORT_PASSWORD, name: 'Support', role: 'support' },
  { email: 'delivery@gmail.com', password: process.env.DELIVERY_PASSWORD, name: 'Delivery', role: 'delivery' },
];

export async function ensurePermanentAccounts() {
  const passwords = PERMANENT_ACCOUNTS.map(({ password }) => password);
  if (passwords.some((password) => typeof password !== 'string' || password.length < 12)) {
    throw new Error('Set a password of at least 12 characters for each permanent staff account in backend/.env.');
  }
  if (new Set(passwords).size !== passwords.length) {
    throw new Error('Use a different password for each permanent staff account in backend/.env.');
  }

  console.log('[accounts] Checking permanent staff accounts...');
  for (const account of PERMANENT_ACCOUNTS) {
    const email = account.email.toLowerCase().trim();
    const existing = await User.findOne({ email });

    if (!existing) {
      await User.create({
        name: account.name,
        email,
        password: await bcrypt.hash(account.password, 12),
        role: account.role,
        addresses: [],
        isSuspended: false,
      });
      console.log(`[accounts] Created permanent account: ${email} (${account.role})`);
      continue;
    }

    const updates = {};
    if (existing.role !== account.role) updates.role = account.role;
    if (existing.isSuspended) updates.isSuspended = false;
    const passwordMatches = await bcrypt.compare(account.password, existing.password).catch(() => false);
    if (!passwordMatches) updates.password = await bcrypt.hash(account.password, 12);

    if (Object.keys(updates).length) {
      await User.findByIdAndUpdate(existing._id, { $set: updates });
      console.log(`[accounts] Synchronized permanent account: ${email} (${account.role})`);
    } else {
      console.log(`[accounts] Account verified: ${email} (${account.role})`);
    }
  }
  console.log('[accounts] Permanent staff account check complete.');
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(currentFilePath)) {
  (async () => {
    try {
      await connectDB();
      await ensurePermanentAccounts();
      await mongoose.disconnect();
      console.log('[accounts] Script completed successfully.');
    } catch (error) {
      await mongoose.disconnect().catch(() => {});
      console.error('[accounts] Execution failed:', error.name, error.message);
      process.exitCode = 1;
    }
  })();
}
