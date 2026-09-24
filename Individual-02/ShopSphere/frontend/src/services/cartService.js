// frontend/src/services/cartService.js
import { api } from './api.js';

export const cartService = {
  mergeGuestCart: async () => {
    const res = await api.post('/cart/merge-guest', {});
    return res.data;
  },
  getCart: async () => {
    const res = await api.get('/cart');
    return res.data?.cart;
  },

  addItem: async (productId, quantity = 1, variant = null) => {
    const res = await api.post('/cart/items', { productId, quantity, variant });
    return res.data?.cart;
  },

  updateQuantity: async (itemId, quantity) => {
    const res = await api.patch(`/cart/items/${itemId}`, { quantity });
    return res.data?.cart;
  },

  removeItem: async (itemId) => {
    const res = await api.delete(`/cart/items/${itemId}`);
    return res.data?.cart;
  },

  validateCoupon: async (code, subtotal) => {
    const res = await api.post('/cart/coupon/validate', { code, subtotal });
    return res.data;
  },
};
