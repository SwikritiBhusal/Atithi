import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const NotificationContext = createContext(null);

const STORAGE_KEY_BASE = 'atithi_notifications_v1';

const defaultNotificationsByRole = {
  tourist: [
    {
      id: 'welcome-tourist',
      title: 'Welcome to Atithi!',
      message: 'Notifications will appear here based on your activity.',
      timestamp: Date.now(),
      read: false,
    },
  ],
  host: [
    {
      id: 'welcome-host',
      title: 'Welcome, Host!',
      message: 'You will receive notifications when guests book or cancel.',
      timestamp: Date.now(),
      read: false,
    },
  ],
  admin: [
    {
      id: 'welcome-admin',
      title: 'Welcome, Admin!',
      message: 'Admin notifications appear here when users take actions.',
      timestamp: Date.now(),
      read: false,
    },
  ],
};

function getStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getStorageKeyForRole(role, userId) {
  // Admin notifications are stored globally so any admin can see them.
  if (role === 'admin') {
    return `${STORAGE_KEY_BASE}_admin_global`;
  }

  // For other roles, we store per user for better isolation
  const idPart = userId || 'unknown';
  return `${STORAGE_KEY_BASE}_${role}_${idPart}`;
}

function getStorageKeyForUser(user) {
  if (!user || !user.role) {
    return `${STORAGE_KEY_BASE}_guest`;
  }
  const idPart = user.id || user._id || user.username || 'unknown';
  return getStorageKeyForRole(user.role, idPart);
}

const legacyDefaultIdsByRole = {
  host: [
    'host-booking-new',
    'host-booking-cancelled',
    'host-review-received',
  ],
  tourist: [],
  admin: [],
};

function sanitizeLegacyNotifications(role, notifications) {
  const legacyIds = legacyDefaultIdsByRole[role] || [];
  if (!legacyIds.length) return notifications;
  return notifications.filter((n) => !legacyIds.includes(n.id));
}

function getDefaultNotificationsForRole(role) {
  return defaultNotificationsByRole[role] || defaultNotificationsByRole.tourist;
}

export function NotificationProvider({ children }) {
  const [storageKey, setStorageKey] = useState(() => {
    const user = getStoredUser();
    return getStorageKeyForUser(user);
  });

  const [notifications, setNotifications] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        const role = getStoredUser()?.role || 'tourist';
        return sanitizeLegacyNotifications(role, parsed);
      }
    } catch {
      // noop
    }
    const role = getStoredUser()?.role || 'tourist';
    return getDefaultNotificationsForRole(role);
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(notifications));
    } catch {
      // noop
    }
  }, [notifications, storageKey]);

  // If the user changes (login/logout/switch), update storage key + notifications
  useEffect(() => {
    const handleStorage = () => {
      const user = getStoredUser();
      const nextKey = getStorageKeyForUser(user);
      if (nextKey === storageKey) return;

      setStorageKey(nextKey);
      try {
        const stored = localStorage.getItem(nextKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          const role = user?.role || 'tourist';
          setNotifications(sanitizeLegacyNotifications(role, parsed));
          return;
        }
      } catch {
        // noop
      }

      const role = user?.role || 'tourist';
      setNotifications(getDefaultNotificationsForRole(role));
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [storageKey]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const addNotification = useCallback((notification) => {
    setNotifications((prev) => [{
      ...notification,
      id: notification.id || `${Date.now()}`,
      timestamp: notification.timestamp || Date.now(),
      read: false,
    },
    ...prev]);
  }, []);

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllRead,
    addNotification,
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
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return ctx;
}

export function addNotificationForRole(role, notification, options = {}) {
  try {
    const key = getStorageKeyForRole(role, options.userId);
    const stored = localStorage.getItem(key);
    const existing = stored ? JSON.parse(stored) : getDefaultNotificationsForRole(role);
    const next = [
      {
        ...notification,
        id: notification.id || `${Date.now()}`,
        timestamp: notification.timestamp || Date.now(),
        read: false,
      },
      ...existing,
    ];
    localStorage.setItem(key, JSON.stringify(next));

    // Notify other tabs and the current tab if needed
    window.dispatchEvent(new Event('storage'));
  } catch {
    // ignore failures (e.g., private mode localStorage restrictions)
  }
}
