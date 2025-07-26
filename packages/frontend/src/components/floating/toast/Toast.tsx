import { X } from "lucide-react";
import type { FC } from "react";
import { cn } from "../../../styling/cn";
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
    className: "bg-card border-border text-card-foreground",
  },
  error: {
    icon: X,
    className: "bg-destructive border-destructive text-background",
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
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
