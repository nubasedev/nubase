import {
  IconAlertTriangle,
  IconCheck,
  IconInfoCircle,
  IconX,
} from "@tabler/icons-react";
import type { FC } from "react";
import { cn } from "../../../utils";
import { ActivityIndicator } from "../../activity-indicator";
import { Button } from "../../buttons/Button/Button";
import type { ToastData } from "./types";

export interface ToastProps {
  toast: ToastData;
  onClose: () => void;
}

const typeConfig = {
  default: {
    icon: null,
    className: "bg-surface border-border text-text",
  },
  success: {
    icon: IconCheck,
    className:
      "bg-secondary/10 border-secondary/20 text-secondary dark:bg-secondary/20 dark:border-secondary/30 dark:text-secondary",
  },
  error: {
    icon: IconX,
    className:
      "bg-error/10 border-error/20 text-error dark:bg-error/20 dark:border-error/30 dark:text-error",
  },
  warning: {
    icon: IconAlertTriangle,
    className:
      "bg-primary/10 border-primary/20 text-primary dark:bg-primary/20 dark:border-primary/30 dark:text-primary",
  },
  info: {
    icon: IconInfoCircle,
    className:
      "bg-primary/10 border-primary/20 text-primary dark:bg-primary/20 dark:border-primary/30 dark:text-primary",
  },
};

export const Toast: FC<ToastProps> = ({ toast, onClose }) => {
  const config = typeConfig[toast.type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-4 rounded-lg border shadow-lg min-w-80 max-w-md",
        "transform transition-all duration-300 ease-out",
        config.className,
      )}
    >
      {toast.promise ? (
        <ActivityIndicator
          size="md"
          color="inherit"
          aria-label="Loading"
          className="flex-shrink-0"
        />
      ) : (
        Icon && <Icon className="h-5 w-5 flex-shrink-0" />
      )}

      <div className="flex-1 text-sm">
        {toast.promise && toast.loadingText ? toast.loadingText : toast.message}
      </div>

      {toast.closable && (
        <Button variant="secondary" onClick={onClose} className="h-6 w-6 p-0">
          <IconX className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
