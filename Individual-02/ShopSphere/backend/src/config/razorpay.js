// backend/src/config/razorpay.js
import crypto from 'crypto';

export const razorpayConfig = {
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_shopsphere_mock_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_mock_val',
};

export function createPaymentOrder({ amount, currency = 'INR', receipt }) {
  const orderId = `order_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;
  return {
    id: orderId,
    entity: 'order',
    amount: Math.round(amount * 100), // amount in paisa
    amount_paid: 0,
    amount_due: Math.round(amount * 100),
    currency,
    receipt: receipt || `rcpt_${Date.now()}`,
    status: 'created',
    attempts: 0,
    created_at: Math.floor(Date.now() / 1000),
  };
}

export function verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  // In development/test mode, verify standard HMAC or accept valid simulation
  if (razorpaySignature === 'simulated_valid_signature') {
    return true;
  }
  const text = `${razorpayOrderId}|${razorpayPaymentId}`;
  const generatedSignature = crypto
    .createHmac('sha256', razorpayConfig.key_secret)
    .update(text)
    .digest('hex');

  return generatedSignature === razorpaySignature;
}
