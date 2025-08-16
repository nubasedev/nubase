import type { ReactNode } from "react";

export type ToastType = "default" | "error";

export type ToastPosition =
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left";

export interface ToastData {
  id: string;
  message: ReactNode;
  type: ToastType;
  duration?: number;
  closable?: boolean;
  promise?: Promise<any>;
  loadingText?: ReactNode;
}

export interface ToastOptions {
  duration?: number;
  closable?: boolean;
}

export interface PromiseToastOptions extends ToastOptions {
  loadingText?: ReactNode;
}

export interface PromiseResult<T = any> {
  success: boolean;
  data?: T;
  error?: any;
}

export interface PromiseToastConfig {
  message: ReactNode;
  type: ToastType;
  duration?: number;
}

export type PromiseToastCallback<T = any> = (
  result: PromiseResult<T>,
) => PromiseToastConfig;

export interface ToastContextType {
  toasts: ToastData[];
  addToast: (
    message: ReactNode,
    type: ToastType,
    options?: ToastOptions,
  ) => string;
  addPromiseToast: <T>(
    promise: Promise<T>,
    callback: PromiseToastCallback<T>,
    options?: PromiseToastOptions,
  ) => string;
  removeToast: (id: string) => void;
  updateToast: (id: string, updates: Partial<ToastData>) => void;
}
