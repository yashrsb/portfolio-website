/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from 'react';

/**
 * @typedef {'success' | 'error' | 'info'} ToastType
 * @typedef {Object} Toast
 * @property {string} id - Unique toast id
 * @property {ToastType} type - Visual variant
 * @property {string} message - Toast message
 */

/**
 * @type {React.Context<{ toasts: Toast[]; showToast: (type: ToastType, message: string) => void; dismissToast: (id: string) => void }>}
 */
const ToastContext = createContext(undefined);

/**
 * Auto-dismiss delay in milliseconds.
 */
const TOAST_DURATION = 4000;

/**
 * ToastProvider — renders a toast stack and exposes helpers.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timerRef = useRef({});

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    if (timerRef.current[id]) {
      clearTimeout(timerRef.current[id]);
      delete timerRef.current[id];
    }
  }, []);

  const showToast = useCallback(
    (type, message) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, type, message }]);

      timerRef.current[id] = setTimeout(() => dismissToast(id), TOAST_DURATION);
    },
    [dismissToast],
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
    </ToastContext.Provider>
  );
}

/**
 * Hook to access toast helpers and the active toast stack.
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
