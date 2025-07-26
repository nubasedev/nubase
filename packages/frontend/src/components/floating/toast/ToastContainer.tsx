import type { FC } from "react";
import { Toast } from "./Toast";
import { useToast } from "./ToastContext";

export interface ToastContainerProps {
  className?: string;
}

export const ToastContainer: FC<ToastContainerProps> = ({ className = "" }) => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className={`
        fixed bottom-4 right-4 z-50 flex flex-col gap-2
        ${className}
      `}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="animate-in slide-in-from-right-full fade-in duration-300"
        >
          <Toast toast={toast} onClose={() => removeToast(toast.id)} />
        </div>
      ))}
    </div>
  );
};
