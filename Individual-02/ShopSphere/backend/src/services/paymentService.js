// backend/src/services/paymentService.js
import { Payment, Order } from '../models/index.js';

/**
 * Payment Service Abstraction Layer
 * Designed to support pluggable payment providers.
 * Currently uses DevelopmentPaymentProvider ("Test / Pay Later" / Sandbox).
 * Future providers (e.g. RazorpayPaymentProvider) can be plugged in
 * without touching Orders, Seller Orders, Checkout, or Notifications.
 */

class DevelopmentPaymentProvider {
  constructor() {
    this.name = 'DevelopmentPaymentProvider';
  }

  async initiate({ amount, currency = 'INR', receipt, userId }) {
    const transactionId = `DEV-PAY-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    return {
      provider: 'DEVELOPMENT',
      transactionId,
      amount,
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      status: 'pending',
      method: 'Test / Pay Later',
      instructions: 'Development sandbox mode active. No live credit card charge was made.',
    };
  }

  async verifyAndRecord({
    orderId,
    userId,
    amount,
    transactionId,
    simulateSuccess = true,
  }) {
    if (!simulateSuccess) {
      throw new Error('Payment processing was declined in development sandbox.');
    }

    const paymentRecord = await Payment.create({
      order: orderId,
      user: userId,
      amount,
      currency: 'INR',
      status: 'captured',
      method: 'Test / Pay Later',
      razorpayOrderId: transactionId || `dev_${Date.now()}`,
      razorpayPaymentId: `dev_captured_${Date.now()}`,
      verifiedAt: new Date().toISOString(),
    });

    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        $set: { paymentStatus: 'paid' },
      });
    }

    return paymentRecord;
  }
}

/**
 * Razorpay Payment Provider Placeholder (Ready for future activation)
 * When RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET are configured in the future,
 * this provider can be selected without modifying marketplace architecture.
 */
class RazorpayPaymentProvider {
  constructor() {
    this.name = 'RazorpayPaymentProvider';
  }

  async initiate() {
    throw new Error('Razorpay is not enabled in this release. Please use the development payment flow.');
  }

  async verifyAndRecord() {
    throw new Error('Razorpay is not enabled in this release. Please use the development payment flow.');
  }
}

// Active provider instance
const activeProvider = new DevelopmentPaymentProvider();

export async function initiatePayment({ amount, currency = 'INR', receipt, userId }) {
  return activeProvider.initiate({ amount, currency, receipt, userId });
}

export async function verifyAndRecordPayment({
  orderId,
  userId,
  amount,
  transactionId,
  simulateSuccess = true,
}) {
  return activeProvider.verifyAndRecord({
    orderId,
    userId,
    amount,
    transactionId,
    simulateSuccess,
  });
}

export { DevelopmentPaymentProvider, RazorpayPaymentProvider };
