// frontend/src/services/productService.js
import { api } from './api.js';

export const productService = {
  getProducts: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await api.get(`/products?${query}`);
    return res.data;
  },

  getProductById: async (id) => {
    const res = await api.get(`/products/${id}`);
    return res.data?.product;
  },

  createProduct: async (productData) => {
    const res = await api.post('/products', productData);
    return res.data?.product;
  },

  updateProduct: async (id, updateData) => {
    const res = await api.patch(`/products/${id}`, updateData);
    return res.data;
  },

  deleteProduct: async (id) => {
    return await api.delete(`/products/${id}`);
  },

  getCategories: async () => {
    const res = await api.get('/products/categories/list');
    return res.data?.categories || [];
  },

  getReviews: async (productId) => {
    const res = await api.get(`/products/${productId}/reviews`);
    return res.data?.reviews || [];
  },

  addReview: async (productId, reviewData) => {
    const res = await api.post(`/products/${productId}/reviews`, reviewData);
    return res.data?.review;
  },

  recordView: async (productId) => {
    return await api.post(`/products/${productId}/view`, {});
  },

  getRecentlyViewed: async () => {
    const res = await api.get('/products/history/recently-viewed');
    return res.data?.products || [];
  },
};
