// frontend/src/services/orderService.js
import { api } from './api.js';

export const orderService = {
  // Multi-vendor checkout is committed atomically by the backend.
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

  requestReturn: async (orderId, reason) => {
    const res = await api.post(`/orders/${orderId}/return`, { reason });
    return res.data?.returnRequest;
  },
};
