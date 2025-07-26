import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { setGlobalToastFunctions } from "./toastUtils";
import type {
  PromiseToastCallback,
  PromiseToastOptions,
  ToastContextType,
  ToastData,
  ToastOptions,
  ToastType,
} from "./types";

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const generateId = useCallback(
    () => Math.random().toString(36).substring(2, 9),
    [],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const updateToast = useCallback((id: string, updates: Partial<ToastData>) => {
    setToasts((prev) =>
      prev.map((toast) => (toast.id === id ? { ...toast, ...updates } : toast)),
    );
  }, []);

  const addToast = useCallback(
    (message: ReactNode, type: ToastType, options: ToastOptions = {}) => {
      const id = generateId();
      const { duration = 10000, closable = true } = options;

      const newToast: ToastData = {
        id,
        message,
        type,
        duration,
        closable,
      };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        // Auto-remove toast after duration
        setTimeout(() => removeToast(id), duration);
      }

      return id;
    },
    [generateId, removeToast],
  );

  const addPromiseToast = useCallback(
    <T,>(
      promise: Promise<T>,
      callback: PromiseToastCallback<T>,
      options: PromiseToastOptions = {},
    ) => {
      const id = generateId();
      const {
        duration = 0, // Don't auto-close promise toasts during loading
        closable = true,
        loadingText = "Loading...",
      } = options;

      const newToast: ToastData = {
        id,
        message: loadingText,
        type: "default",
        duration,
        closable,
        promise,
        loadingText,
      };

      setToasts((prev) => [...prev, newToast]);

      // Handle promise resolution/rejection
      promise
        .then((data) => {
          const result = callback({ success: true, data });
          updateToast(id, {
            type: result.type,
            message: result.message,
            duration: result.duration || 3000,
            promise: undefined, // Clear the promise to exit loading state
          });
          setTimeout(() => removeToast(id), result.duration || 3000);
        })
        .catch((error) => {
          const result = callback({ success: false, error });
          updateToast(id, {
            type: result.type,
            message: result.message,
            duration: result.duration || 5000,
            promise: undefined, // Clear the promise to exit loading state
          });
          setTimeout(() => removeToast(id), result.duration || 5000);
        });

      return id;
    },
    [generateId, removeToast, updateToast],
  );

  // Initialize global toast functions
  useEffect(() => {
    setGlobalToastFunctions(addToast, addPromiseToast);
  }, [addToast, addPromiseToast]);

  const value: ToastContextType = {
    toasts,
    addToast,
    addPromiseToast,
    removeToast,
    updateToast,
  };

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
};
