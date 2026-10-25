/**
 * ToastContext.jsx — Piyush's Task (PE2 Feature 2)
 *
 * Global Toast notification system built on Context API.
 * Provides:
 *   addToast(message, type, duration?)  – fire a new toast
 *   removeToast(id)                     – dismiss a toast programmatically
 *
 * Toast types: 'success' | 'error' | 'warning' | 'info'
 * Toasts auto-dismiss after `duration` ms (default 4000).
 * Max 5 toasts visible at once (oldest auto-removed).
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from 'react';
import './Toast.css';

const ToastContext = createContext(null);

const ICONS = {
  success: '✓',
  error:   '✕',
  warning: '⚠',
  info:    'ℹ',
};

const MAX_TOASTS = 5;

// ── Individual Toast ──────────────────────────────────────────────────────────
function ToastItem({ id, message, type, onRemove }) {
  return (
    <div
      className={`toast toast--${type}`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <span className="toast__icon" aria-hidden="true">
        {ICONS[type] ?? ICONS.info}
      </span>
      <p className="toast__message">{message}</p>
      <button
        className="toast__close"
        onClick={() => onRemove(id)}
        aria-label="Dismiss notification"
        type="button"
      >
        ✕
      </button>
    </div>
  );
}

// ── Provider ─────────────────────────────────────────────────────────────────
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const removeToast = useCallback((id) => {
    clearTimeout(timersRef.current[id]);
    delete timersRef.current[id];
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    setToasts(prev => {
      const next = [...prev, { id, message, type }];
      // Keep at most MAX_TOASTS
      return next.length > MAX_TOASTS ? next.slice(next.length - MAX_TOASTS) : next;
    });

    // Auto-dismiss
    timersRef.current[id] = setTimeout(() => removeToast(id), duration);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}

      {/* ── Toast Viewport ── */}
      <div
        className="toast-viewport"
        aria-label="Notifications"
        role="region"
      >
        {toasts.map(t => (
          <ToastItem
            key={t.id}
            id={t.id}
            message={t.message}
            type={t.type}
            onRemove={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ── Consumer hook ─────────────────────────────────────────────────────────────
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a <ToastProvider>');
  return ctx;
}

export default ToastContext;
