// frontend/src/context/NotificationContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { notificationService } from '../services/notificationService.js';
import { useAuth } from './AuthContext.jsx';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestPriceDrop, setLatestPriceDrop] = useState(null);
  const intervalRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const data = await notificationService.getNotifications();
      if (data) {
        const notifs = data.notifications || [];
        setNotifications(notifs);
        setUnreadCount(data.unreadCount || 0);

        // Check for latest unread PRICE_DROP notification to highlight
        const priceDrop = notifs.find(n => n.type === 'PRICE_DROP' && !n.isRead);
        if (priceDrop) {
          setLatestPriceDrop(priceDrop);
        }
      }
    } catch (e) {
      // Do not spam the console — silently skip failed notification fetches
    }
  }, [user]);

  useEffect(() => {
    // Clear any existing polling interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Do not start polling until auth is determined
    if (authLoading) return;

    // If there is no user, reset notifications and do not poll
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLatestPriceDrop(null);
      return;
    }

    // User is authenticated — fetch immediately and then poll every 30 seconds
    fetchNotifications();
    intervalRef.current = setInterval(fetchNotifications, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [authLoading, user?._id, fetchNotifications]);

  const markAsRead = async (id) => {
    await notificationService.markAsRead(id);
    await fetchNotifications();
    if (latestPriceDrop?._id === id) {
      setLatestPriceDrop(null);
    }
  };

  const markAllRead = async () => {
    await notificationService.markAllRead();
    await fetchNotifications();
    setLatestPriceDrop(null);
  };

  const dismissPriceDropAlert = () => {
    if (latestPriceDrop) {
      markAsRead(latestPriceDrop._id);
    }
    setLatestPriceDrop(null);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        latestPriceDrop,
        fetchNotifications,
        markAsRead,
        markAllRead,
        dismissPriceDropAlert,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
