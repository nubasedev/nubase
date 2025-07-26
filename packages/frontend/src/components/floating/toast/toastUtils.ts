import type { ReactNode } from "react";
import type {
  PromiseToastCallback,
  PromiseToastOptions,
  ToastContextType,
  ToastOptions,
  ToastType,
} from "./types";

// Global toast functions - will be initialized by ToastProvider
let globalAddToast: ToastContextType["addToast"] | null = null;
let globalAddPromiseToast: ToastContextType["addPromiseToast"] | null = null;

export const setGlobalToastFunctions = (
  addToast: ToastContextType["addToast"],
  addPromiseToast: ToastContextType["addPromiseToast"],
) => {
  globalAddToast = addToast;
  globalAddPromiseToast = addPromiseToast;
};

// Simple toast function - just message and type
export const showToast = (
  message: ReactNode,
  type: ToastType = "default",
  options?: ToastOptions,
): string => {
  if (!globalAddToast) {
    console.warn("Toast function called before ToastProvider is initialized");
    return "";
  }
  return globalAddToast(message, type, options);
};

// Promise toast function with callback
export const showPromiseToast = <T>(
  promise: Promise<T>,
  callback: PromiseToastCallback<T>,
  options?: PromiseToastOptions,
): string => {
  if (!globalAddPromiseToast) {
    console.warn(
      "Promise toast function called before ToastProvider is initialized",
    );
    return "";
  }
  return globalAddPromiseToast(promise, callback, options);
};
