import { DialogPanel, Dialog as HeadlessDialog } from "@headlessui/react";
import type { FC, ReactElement } from "react";
import { cloneElement } from "react";
import { usePresence } from "../../../hooks/usePresence";
import type { BaseModalFrameProps, ModalAlignment, ModalSize } from "./types";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  content: ReactElement<BaseModalFrameProps>;
  alignment?: ModalAlignment;
  showBackdrop?: boolean;
  size?: ModalSize;
  zIndex?: number;
  onExited?: () => void;
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

const PANEL_ANIMATION =
  "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in data-[state=closed]:fade-out data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 duration-200";

const BACKDROP_ANIMATION =
  "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in data-[state=closed]:fade-out duration-200";

export const Modal: FC<ModalProps> = ({
  open,
  onClose,
  content,
  alignment = "center",
  showBackdrop = true,
  size = "md",
  zIndex = 50,
  onExited,
}) => {
  const { shouldRender, presenceProps } = usePresence(open, { onExited });

  if (!shouldRender) return null;

  return (
    <HeadlessDialog
      open
      onClose={onClose}
      className="relative"
      style={{ zIndex }}
    >
      {showBackdrop && (
        <div
          aria-hidden="true"
          data-state={presenceProps["data-state"]}
          className={`fixed inset-0 bg-black/50 ${BACKDROP_ANIMATION}`}
          style={{ animationFillMode: "forwards" }}
        />
      )}

      <div className={`fixed inset-0 flex p-4 ${alignmentClasses[alignment]}`}>
        <DialogPanel
          {...presenceProps}
          className={`w-full ${sizeClasses[size]} ${PANEL_ANIMATION}`}
          style={{ animationFillMode: "forwards" }}
        >
          {cloneElement(content, { onClose })}
        </DialogPanel>
      </div>
    </HeadlessDialog>
  );
};
