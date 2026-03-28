import React, { useEffect, useRef, useState } from "react";
import { Bell, Check, X } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";
import "./NotificationBell.css";

export default function NotificationBell({ compact = false }) {
  const { notifications, unreadCount, markAsRead, markAllRead, fetchNotifications } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // ⭐ ADD: Re-fetch when component mounts or user changes
  useEffect(() => {
    console.log('🔔 NotificationBell mounted, fetching notifications');
    fetchNotifications();
  }, []); // Runs when bell icon first appears

  // ⭐ ADD: Watch for notification changes
  useEffect(() => {
    console.log('🔔 Notifications updated:', notifications.length);
  }, [notifications]);

  useEffect(() => {
    const onClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleToggle = () => {
    console.log('🔔 Bell clicked, current notifications:', notifications.length);
    setOpen((prev) => !prev);
  };

  const handleMarkAllRead = () => {
    console.log('✅ Mark all as read clicked');
    markAllRead();
  };

  const handleClickNotification = (id) => {
    console.log('✅ Mark notification as read:', id);
    markAsRead(id);
  };

  // ⭐ IMPORTANT: Don't sort here, use notifications directly
  // Sorting creates a new array reference which might cause issues
  const sortedNotifications = React.useMemo(() => {
    console.log('🔄 Re-sorting notifications:', notifications.length);
    return [...notifications].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [notifications]); // Only re-sort when notifications change

  return (
    <div className={`notification-bell ${compact ? "compact" : ""}`} ref={ref}>
      
      {/* Bell Button */}
      <button
        className="bell-button"
        onClick={handleToggle}
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="notification-dropdown">
          
          {/* Header */}
          <div className="notification-header">
            <span>Notifications ({sortedNotifications.length})</span>

            {unreadCount > 0 && (
              <button
                className="mark-read-button"
                onClick={handleMarkAllRead}
              >
                <Check size={14} /> Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="notification-list">
            {sortedNotifications.length === 0 ? (
              <div className="notification-empty">
                No notifications yet.
              </div>
            ) : (
              sortedNotifications.map((notification) => (
                <button
                  key={notification._id}
                  className={`notification-item ${
                    notification.read ? "read" : "unread"
                  }`}
                  onClick={() => handleClickNotification(notification._id)}
                  type="button"
                >
                  <div className="notification-content">
                    <div className="notification-title">
                      {notification.title}
                    </div>

                    <div className="notification-message">
                      {notification.message}
                    </div>
                  </div>

                  <div className="notification-meta">
                    <span className="notification-time">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>

                    {!notification.read && (
                      <span className="notification-dot" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Close Button */}
          <button
            className="notification-close"
            onClick={() => setOpen(false)}
          >
            <X size={16} />
            Close
          </button>

        </div>
      )}
    </div>
  );
}