import { api } from './api.js';

export const deliveryService = {
  getDeliveries: async (params = {}) => {
    const response = await api.get('/delivery', { params });
    return response.data?.deliveries || [];
  },

  getActiveDelivery: async () => {
    const response = await api.get('/delivery/active');
    return response.data?.delivery;
  },

  getDeliveryById: async (id) => {
    const response = await api.get(`/delivery/${id}`);
    return response.data?.delivery;
  },

  updateDeliveryStatus: async (id, statusData) => {
    const response = await api.patch(`/delivery/${id}/status`, statusData);
    return response.data?.delivery;
  },

  addTrackingCheckpoint: async (id, checkpointData) => {
    const response = await api.post(`/delivery/${id}/tracking`, checkpointData);
    return response.data?.delivery;
  },
};
