import { createContext, useContext, useState, type ReactNode, useCallback, useEffect } from "react";
import type { ToastData, ToastOptions, ToastContextType } from "./types";
import { setGlobalToast } from "./toastUtils";

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

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const updateToast = useCallback((id: string, updates: Partial<ToastData>) => {
    setToasts(prev => prev.map(toast => 
      toast.id === id ? { ...toast, ...updates } : toast
    ));
  }, []);

  const addToast = useCallback((message: ReactNode, options: ToastOptions = {}) => {
    const id = generateId();
    const { type = "default", duration = 4000, closable = true, promise, ...promiseOptions } = options;
    
    const newToast: ToastData = {
      id,
      message,
      type: promise ? "promise" : type,
      duration,
      closable,
      promise,
      ...promiseOptions,
    };

    setToasts(prev => [...prev, newToast]);

    // Handle promise toasts
    if (promise) {
      promise
        .then(() => {
          updateToast(id, {
            type: "success",
            message: promiseOptions.successText || "Success!",
            duration: 3000,
          });
          setTimeout(() => removeToast(id), 3000);
        })
        .catch(() => {
          updateToast(id, {
            type: "error",
            message: promiseOptions.errorText || "Error occurred",
            duration: 5000,
          });
          setTimeout(() => removeToast(id), 5000);
        });
    } else if (duration > 0) {
      // Auto-remove toast after duration
      setTimeout(() => removeToast(id), duration);
    }

    return id;
  }, [removeToast, updateToast]);

  // Initialize global toast function
  useEffect(() => {
    setGlobalToast(addToast);
  }, [addToast]);

  const value: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    updateToast,
  };

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};