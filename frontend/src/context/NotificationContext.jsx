import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";

axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Cache-Control'] = 'no-cache, no-store, must-revalidate';
axios.defaults.headers.common['Pragma'] = 'no-cache';
axios.defaults.headers.common['Expires'] = '0';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState(Date.now()); 

  const fetchNotifications = async () => {
    try {
      const user = localStorage.getItem('user');
      
      if (!user) {
        console.log('❌ No user, clearing notifications');
        setNotifications([]);
        setLoading(false);
        return;
      }

      const userData = JSON.parse(user);
      console.log('🔄 Fetching notifications for user:', userData.id);
      
      // ⭐ Add timestamp to prevent caching
      const res = await axios.get(`/api/notifications?t=${Date.now()}`);

      console.log('📡 API Response:', res.data);

      if (res.data.success) {
        const notifs = res.data.notifications || [];
        console.log('✅ Setting', notifs.length, 'notifications');
        
        // ⭐ Force new array reference
        setNotifications([...notifs]);
        setLastFetch(Date.now()); // ⭐ Update timestamp
        
        // Log each notification
        notifs.forEach(n => {
          console.log('  📬', n.title, '- userId:', n.userId);
        });
      } else {
        console.log('⚠️ No notifications returned');
        setNotifications([]);
      }

    } catch (error) {
      console.error("❌ Fetch error:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const clearNotifications = () => {
    console.log('🗑️ Clearing all notifications');
    setNotifications([]);
    setLastFetch(Date.now());
  };

  // Fetch on mount
  useEffect(() => {
    console.log('🎯 NotificationProvider mounted');
    fetchNotifications();
  }, []);

  // ⭐ LISTEN FOR USER CHANGES
  useEffect(() => {
    const checkUser = () => {
      const user = localStorage.getItem('user');
      if (user) {
        console.log('👤 User detected, fetching notifications');
        fetchNotifications();
      } else {
        console.log('❌ No user detected, clearing notifications');
        clearNotifications();
      }
    };

    // Listen for storage changes
    window.addEventListener('storage', checkUser);
    
    // ⭐ Also listen for custom event (for same-tab logout)
    window.addEventListener('userChanged', checkUser);

    return () => {
      window.removeEventListener('storage', checkUser);
      window.removeEventListener('userChanged', checkUser);
    };
  }, []);

  const unreadCount = useMemo(() => {
    const count = notifications.filter((n) => !n.read).length;
    console.log('📊 Unread count:', count);
    return count;
  }, [notifications]);

  const markAsRead = async (id) => {
    try {
      console.log('✅ Marking as read:', id);
      await axios.put(`/api/notifications/read/${id}`);
      
      setNotifications((prev) => {
        const updated = prev.map((n) => 
          n._id === id ? { ...n, read: true } : n
        );
        console.log('📝 Updated notifications after mark read');
        return [...updated]; // ⭐ New array reference
      });

    } catch (error) {
      console.error("❌ Mark as read error:", error);
    }
  };

  const markAllRead = async () => {
    try {
      console.log('✅ Marking all as read');
      await axios.put("/api/notifications/read-all");
      
      setNotifications((prev) => {
        const updated = prev.map((n) => ({ ...n, read: true }));
        console.log('📝 Updated all notifications to read');
        return [...updated]; // ⭐ New array reference
      });

    } catch (error) {
      console.error("❌ Mark all read error:", error);
    }
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    lastFetch, // ⭐ Include timestamp
    markAsRead,
    markAllRead,
    fetchNotifications,
    clearNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return ctx;
}