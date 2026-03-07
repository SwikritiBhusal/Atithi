import React, { useEffect, useRef, useState } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import './NotificationBell.css';

export default function NotificationBell({ compact = false }) {
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const handleMarkAllRead = () => {
    markAllRead();
  };

  const handleClickNotification = (id) => {
    markAsRead(id);
  };

  const sortedNotifications = [...notifications].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className={`notification-bell ${compact ? 'compact' : ''}`} ref={ref}>
      <button className="bell-button" onClick={handleToggle} aria-label="Notifications">
        <Bell size={20} />
        {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button className="mark-read-button" onClick={handleMarkAllRead}>
                <Check size={14} /> Mark all read
              </button>
            )}
          </div>
          <div className="notification-list">
            {sortedNotifications.length === 0 ? (
              <div className="notification-empty">No notifications yet.</div>
            ) : (
              sortedNotifications.map((notification) => (
                <button
                  key={notification.id}
                  className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                  onClick={() => handleClickNotification(notification.id)}
                  type="button"
                >
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                  </div>
                  <div className="notification-meta">
                    <span className="notification-time">
                      {new Date(notification.timestamp).toLocaleString()}
                    </span>
                    {!notification.read && <span className="notification-dot" />}
                  </div>
                </button>
              ))
            )}
          </div>
          <button className="notification-close" onClick={() => setOpen(false)}>
            <X size={16} />
            Close
          </button>
        </div>
      )}
    </div>
  );
}
