import {
  DialogBackdrop,
  DialogPanel,
  Dialog as HeadlessDialog,
} from "@headlessui/react";
import type { FC, ReactElement } from "react";
import { cloneElement } from "react";
import type { BaseModalFrameProps, ModalAlignment, ModalSize } from "./types";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  content: ReactElement<BaseModalFrameProps>;
  alignment?: ModalAlignment;
  showBackdrop?: boolean;
  size?: ModalSize;
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
  content,
  alignment = "center",
  showBackdrop = true,
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
        <DialogBackdrop className="fixed inset-0 bg-scrim/30 backdrop-blur-xxs transition-opacity duration-300 ease-out data-[closed]:opacity-0" />
      )}

      <div className={`fixed inset-0 flex p-4 ${alignmentClasses[alignment]}`}>
        <DialogPanel
          className={`w-full ${sizeClasses[size]} transition-all duration-300 ease-out data-[closed]:scale-95 data-[closed]:opacity-0`}
        >
          {cloneElement(content, { onClose })}
        </DialogPanel>
      </div>
    </HeadlessDialog>
  );
};
