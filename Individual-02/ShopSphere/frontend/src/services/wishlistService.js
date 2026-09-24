// frontend/src/services/wishlistService.js
import { api } from './api.js';

export const wishlistService = {
  getWishlist: async () => {
    const res = await api.get('/wishlist');
    return res.data?.wishlist;
  },

  addItem: async (productId) => {
    const res = await api.post('/wishlist', { productId });
    return res.data?.wishlist;
  },

  removeItem: async (productId) => {
    const res = await api.delete(`/wishlist/${productId}`);
    return res.data?.wishlist;
  },

  moveToCart: async (productId) => {
    return await api.post('/wishlist/move-to-cart', { productId });
  },
};
