import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import './toast.css';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const icons = {
  success: <CheckCircle size={20} />,
  error:   <XCircle size={20} />,
  warning: <AlertCircle size={20} />,
  info:    <Info size={20} />
};

export function Toast({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onRemove(toast.id), 350);
    }, toast.duration || 3500);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setExiting(true);
    setTimeout(() => onRemove(toast.id), 350);
  };

  return (
    <div className={`toast toast-${toast.type} ${exiting ? 'toast-exit' : 'toast-enter'}`}>
      <div className="toast-icon">{icons[toast.type]}</div>
      <div className="toast-body">
        <p className="toast-title">{toast.title}</p>
        {toast.message && <p className="toast-message">{toast.message}</p>}
      </div>
      <button className="toast-close" onClick={handleClose}><X size={14} /></button>
      <div className="toast-progress">
        <div
          className="toast-progress-bar"
          style={{ animationDuration: `${toast.duration || 3500}ms` }}
        />
      </div>
    </div>
  );
}

// Custom hook — use this in any component
const noopToast = {
  success: () => {},
  error: () => {},
  warning: () => {},
  info: () => {}
};

const ToastContext = createContext(noopToast);

export function ToastProvider({ children }) {
  const { toasts, toast, removeToast } = useToast();

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <Toast toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useAppToast() {
  return useContext(ToastContext);
}

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, title, message = '', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, title, message, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useMemo(() => ({
    success: (title, message, duration) => addToast('success', title, message, duration),
    error:   (title, message, duration) => addToast('error',   title, message, duration),
    warning: (title, message, duration) => addToast('warning', title, message, duration),
    info:    (title, message, duration) => addToast('info',    title, message, duration),
  }), [addToast]);

  return { toasts, toast, removeToast };
}
