// backend/src/services/notificationService.js
import { Notification } from '../models/index.js';

export async function getUserNotifications(userId) {
  if (!userId) return [];
  const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
  return notifications || [];
}

export async function markNotificationAsRead(notificationId, userId) {
  return await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { $set: { isRead: true } },
    { new: true }
  );
}

export async function markAllNotificationsAsRead(userId) {
  return await Notification.updateMany(
    { user: userId },
    { $set: { isRead: true } }
  );
}
