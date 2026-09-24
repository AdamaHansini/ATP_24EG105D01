// backend/src/controllers/notificationController.js
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/notificationService.js';

export async function getNotifications(req, res, next) {
  try {
    const userId = req.user._id;
    const notifications = await getUserNotifications(userId);
    const unreadCount = (notifications || []).filter(n => !n.isRead).length;

    res.json({
      success: true,
      message: 'Notifications retrieved',
      data: {
        notifications: notifications || [],
        unreadCount,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function markAsRead(req, res, next) {
  try {
    const updated = await markNotificationAsRead(req.params.id, req.user._id);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({ success: true, message: 'Notification marked as read', data: { notification: updated } });
  } catch (err) {
    next(err);
  }
}

export async function markAllRead(req, res, next) {
  try {
    const userId = req.user._id;
    await markAllNotificationsAsRead(userId);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
}
