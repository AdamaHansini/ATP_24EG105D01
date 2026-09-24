// frontend/src/services/aiService.js
import { api } from './api.js';

export const aiService = {
  // SIGNATURE FEATURE 1: AI Product Tag & Category Predictor
  predictProduct: async (productDetails) => {
    const res = await api.post('/ai/predict-product', productDetails, { timeout: 45000 });
    return res.data;
  },

  // AI Description Generator
  generateDescription: async (payload) => {
    const res = await api.post('/ai/generate-description', payload);
    return res.data;
  },

  // AI Tag Generator
  generateTags: async (payload) => {
    const res = await api.post('/ai/generate-tags', payload);
    return res.data?.tags;
  },

  // AI Recommendations
  getRecommendations: async (productId = '') => {
    const res = await api.get(`/ai/recommendations?productId=${productId}`);
    return res.data?.products || [];
  },
};
