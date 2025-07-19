import {
  DialogBackdrop,
  DialogPanel,
  Dialog as HeadlessDialog,
} from "@headlessui/react";
import { IconX } from "@tabler/icons-react";
import type { FC, ReactNode } from "react";
import { Button } from "../../buttons/Button/Button";

export type ModalAlignment = "center" | "top";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  alignment?: ModalAlignment;
  showBackdrop?: boolean;
  showCloseButton?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  zIndex?: number;
};

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  full: "max-w-full",
};

const alignmentClasses = {
  center: "items-center justify-center",
  top: "items-start justify-center pt-16",
};

export const Modal: FC<ModalProps> = ({
  open,
  onClose,
  children,
  alignment = "center",
  showBackdrop = true,
  showCloseButton = false,
  className = "",
  size = "md",
  zIndex = 50,
}) => {
  return (
    <HeadlessDialog
      open={open}
      onClose={onClose}
      className="relative"
      style={{ zIndex }}
    >
      {showBackdrop && (
        <DialogBackdrop className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ease-out data-[closed]:opacity-0" />
      )}

      <div className={`fixed inset-0 flex p-4 ${alignmentClasses[alignment]}`}>
        <DialogPanel
          className={`w-full ${sizeClasses[size]} rounded-lg bg-white shadow-xl ring-1 ring-black/5 transition-all duration-300 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 ${className}`}
        >
          {showCloseButton && (
            <div className="flex justify-end p-2">
              <Button
                variant="secondary"
                size="icon"
                onClick={onClose}
              >
                <IconX className="h-5 w-5" />
              </Button>
            </div>
          )}

          <div className={showCloseButton ? "px-6 pb-6" : "p-6"}>
            {children}
          </div>
        </DialogPanel>
      </div>
    </HeadlessDialog>
  );
};
