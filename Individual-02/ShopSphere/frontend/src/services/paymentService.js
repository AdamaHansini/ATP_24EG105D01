// frontend/src/services/paymentService.js
import { api } from './api.js';

export const paymentService = {
  /**
   * Initialize a development payment session
   */
  createPaymentOrder: async (amount, receipt) => {
    const res = await api.post('/payments/create', { amount, receipt });
    return res.data;
  },

  /**
   * Complete payment verification in development sandbox mode
   */
  verifyPayment: async (paymentData) => {
    const res = await api.post('/payments/verify', paymentData);
    return res.data;
  },
};
