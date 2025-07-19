import type { ReactNode } from "react";
import type { ToastOptions } from "./types";

// Global toast function - will be initialized by ToastProvider
let globalToast: ((message: ReactNode, options?: ToastOptions) => string) | null = null;

export const setGlobalToast = (toastFn: (message: ReactNode, options?: ToastOptions) => string) => {
  globalToast = toastFn;
};

// Main toast function
export const toast = (message: ReactNode, options?: ToastOptions): string => {
  if (!globalToast) {
    console.warn("Toast function called before ToastProvider is initialized");
    return "";
  }
  return globalToast(message, options);
};

// Convenience methods
toast.success = (message: ReactNode, options?: Omit<ToastOptions, "type">) => {
  return toast(message, { ...options, type: "success" });
};

toast.error = (message: ReactNode, options?: Omit<ToastOptions, "type">) => {
  return toast(message, { ...options, type: "error" });
};

toast.warning = (message: ReactNode, options?: Omit<ToastOptions, "type">) => {
  return toast(message, { ...options, type: "warning" });
};

toast.info = (message: ReactNode, options?: Omit<ToastOptions, "type">) => {
  return toast(message, { ...options, type: "info" });
};

toast.promise = <T>(
  promise: Promise<T>,
  messages: {
    loading: ReactNode;
    success: ReactNode;
    error: ReactNode;
  },
  options?: Omit<ToastOptions, "type" | "promise" | "loadingText" | "successText" | "errorText">
) => {
  return toast(messages.loading, {
    ...options,
    type: "promise",
    promise,
    loadingText: messages.loading,
    successText: messages.success,
    errorText: messages.error,
    duration: 0, // Don't auto-close promise toasts
  });
};