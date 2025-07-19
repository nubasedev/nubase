import { DialogTitle } from "@headlessui/react";
import { IconX } from "@tabler/icons-react";
import type { FC, ReactNode } from "react";
import { Button } from "../../buttons/Button/Button";
import { ButtonBar } from "../../buttons/ButtonBar/ButtonBar";
import { Modal, type ModalAlignment } from "../modal/Modal";

export type DialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  showCloseButton?: boolean;
  className?: string;
  alignment?: ModalAlignment;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "primary" | "danger";
  showBackdrop?: boolean;
  zIndex?: number;
};

export const Dialog: FC<DialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  children,
  size = "md",
  showCloseButton = true,
  className = "",
  alignment = "center",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "primary",
  showBackdrop = true,
  zIndex,
}) => {
  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size={size}
      alignment={alignment}
      showBackdrop={showBackdrop}
      className={className}
      zIndex={zIndex}
    >
      {(title || showCloseButton) && (
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          {title && (
            <DialogTitle className="text-lg font-semibold text-gray-900">
              {title}
            </DialogTitle>
          )}
          {showCloseButton && (
            <Button variant="secondary" size="icon" onClick={onClose}>
              <IconX className="h-5 w-5" />
            </Button>
          )}
        </div>
      )}

      <div className="px-6 py-4">{children}</div>

      {onConfirm && (
        <div className="border-t border-gray-200 px-6 py-4">
          <ButtonBar>
            <Button variant="secondary" onClick={onClose}>
              {cancelText}
            </Button>
            <Button variant={confirmVariant} onClick={handleConfirm}>
              {confirmText}
            </Button>
          </ButtonBar>
        </div>
      )}
    </Modal>
  );
};
