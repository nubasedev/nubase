import { IconCheck, IconX, IconAlertTriangle, IconInfoCircle, IconLoader2 } from "@tabler/icons-react";
import type { FC } from "react";
import { Button } from "../../buttons/Button/Button";
import type { ToastData } from "./types";

export interface ToastProps {
  toast: ToastData;
  onClose: () => void;
}

const typeConfig = {
  default: {
    icon: null,
    className: "bg-white border-gray-200 text-gray-900",
  },
  success: {
    icon: IconCheck,
    className: "bg-green-50 border-green-200 text-green-800",
  },
  error: {
    icon: IconX,
    className: "bg-red-50 border-red-200 text-red-800",
  },
  warning: {
    icon: IconAlertTriangle,
    className: "bg-yellow-50 border-yellow-200 text-yellow-800",
  },
  info: {
    icon: IconInfoCircle,
    className: "bg-blue-50 border-blue-200 text-blue-800",
  },
  promise: {
    icon: IconLoader2,
    className: "bg-gray-50 border-gray-200 text-gray-800",
  },
};

export const Toast: FC<ToastProps> = ({ toast, onClose }) => {
  const config = typeConfig[toast.type];
  const Icon = config.icon;

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg border shadow-lg min-w-80 max-w-md
        transform transition-all duration-300 ease-out
        ${config.className}
      `}
    >
      {Icon && (
        <Icon 
          className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
            toast.type === "promise" ? "animate-spin" : ""
          }`} 
        />
      )}
      
      <div className="flex-1 text-sm">
        {toast.type === "promise" && toast.loadingText ? toast.loadingText : toast.message}
      </div>

      {toast.closable && (
        <Button
          variant="secondary"
          size="icon"
          onClick={onClose}
          className="h-6 w-6 p-0 hover:bg-black/10"
        >
          <IconX className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};