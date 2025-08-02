import {
  DialogBackdrop,
  DialogPanel,
  Dialog as HeadlessDialog,
} from "@headlessui/react";
import type { FC, ReactNode } from "react";

export type ModalStructuredAlignment = "center" | "top";

export type ModalStructuredProps = {
  open: boolean;
  onClose: () => void;
  /** Modal header content (fixed at top) */
  header?: ReactNode;
  /** Modal body content (scrollable) */
  body?: ReactNode;
  /** Modal footer content (fixed at bottom) */
  footer?: ReactNode;
  alignment?: ModalStructuredAlignment;
  showBackdrop?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  zIndex?: number;
  initialFocus?: React.RefObject<HTMLElement | null>;
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

export const ModalStructured: FC<ModalStructuredProps> = ({
  open,
  onClose,
  header,
  body,
  footer,
  alignment = "center",
  showBackdrop = true,
  className = "",
  size = "md",
  zIndex = 50,
  initialFocus,
}) => {
  return (
    <HeadlessDialog
      open={open}
      onClose={onClose}
      className="relative"
      style={{ zIndex }}
      initialFocus={initialFocus}
    >
      {showBackdrop && (
        <DialogBackdrop className="fixed inset-0 bg-scrim/30 backdrop-blur-xxs transition-opacity duration-300 ease-out data-[closed]:opacity-0" />
      )}

      <div className={`fixed inset-0 flex p-4 ${alignmentClasses[alignment]}`}>
        <DialogPanel
          className={`w-full ${sizeClasses[size]} rounded-lg bg-surface shadow-xl ring-1 ring-outline/20 transition-all duration-300 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 ${className} flex flex-col overflow-hidden`}
          style={{ maxHeight: "calc(100vh - 2rem)" }}
        >
          {/* Header - Fixed at top */}
          {header && <div className="flex-shrink-0 p-4 pb-3">{header}</div>}

          {/* Body - Scrollable content */}
          {body && (
            <div
              className={`flex-1 overflow-y-auto min-h-0 pb-4 ${!header ? "p-4" : "px-4"}`}
            >
              {body}
            </div>
          )}

          {/* Footer - Fixed at bottom */}
          {footer && (
            <div className="flex-shrink-0 bg-surfaceVariant">{footer}</div>
          )}
        </DialogPanel>
      </div>
    </HeadlessDialog>
  );
};
