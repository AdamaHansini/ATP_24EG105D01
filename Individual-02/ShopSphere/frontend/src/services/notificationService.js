// frontend/src/services/notificationService.js
import { api } from './api.js';

export const notificationService = {
  // SIGNATURE FEATURE 3: Price Drop Notification receiver
  getNotifications: async () => {
    const res = await api.get('/notifications');
    return res.data;
  },

  markAsRead: async (id) => {
    const res = await api.patch(`/notifications/${id}/read`, {});
    return res.data?.notification;
  },

  markAllRead: async () => {
    return await api.patch('/notifications/read-all', {});
  },
};
