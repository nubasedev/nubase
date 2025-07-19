import type { ReactNode } from "react";

export type ToastType =
  | "default"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "promise";

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
  successText?: ReactNode;
  errorText?: ReactNode;
}

export interface ToastOptions {
  type?: ToastType;
  duration?: number;
  closable?: boolean;
  promise?: Promise<any>;
  loadingText?: ReactNode;
  successText?: ReactNode;
  errorText?: ReactNode;
}

export interface ToastContextType {
  toasts: ToastData[];
  addToast: (message: ReactNode, options?: ToastOptions) => string;
  removeToast: (id: string) => void;
  updateToast: (id: string, updates: Partial<ToastData>) => void;
}
