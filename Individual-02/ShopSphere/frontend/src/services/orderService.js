// frontend/src/services/orderService.js
import { api } from './api.js';

export const orderService = {
  // SIGNATURE FEATURE 2: Multi-vendor checkout with atomic transaction rollback
  checkout: async (checkoutPayload) => {
    const res = await api.post('/orders/checkout', checkoutPayload);
    return res.data;
  },

  getOrders: async () => {
    const res = await api.get('/orders');
    return res.data?.orders || [];
  },

  getOrderById: async (id) => {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },

  updateStatus: async (orderId, status, isSellerOrder = false) => {
    const res = await api.patch(`/orders/${orderId}/status`, { status, isSellerOrder });
    return res.data?.order;
  },

  cancelOrder: async (orderId, reason) => {
    const res = await api.post(`/orders/${orderId}/cancel`, { reason });
    return res;
  },

  // Admin-only rollback simulation (requires admin JWT)
  simulateRollbackTest: async (simulateFailure = true) => {
    const res = await api.post('/admin/simulate-rollback', { simulateFailure });
    return res;
  },
};
