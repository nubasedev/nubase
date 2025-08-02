import { DialogTitle } from "@headlessui/react";
import type { FC, ReactNode } from "react";
import { Button } from "../../buttons/Button/Button";
import { ButtonBar } from "../../buttons/ButtonBar/ButtonBar";
import {
  ModalStructured,
  type ModalStructuredAlignment,
} from "../modal/ModalStructured";

export type DialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  alignment?: ModalStructuredAlignment;
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

  const header = title ? (
    <DialogTitle className="text-lg font-semibold text-onSurface">
      {title}
    </DialogTitle>
  ) : undefined;

  const footer = onConfirm ? (
    <ButtonBar>
      <Button variant="secondary" onClick={onClose}>
        {cancelText}
      </Button>
      <Button variant={confirmVariant} onClick={handleConfirm}>
        {confirmText}
      </Button>
    </ButtonBar>
  ) : undefined;

  return (
    <ModalStructured
      open={open}
      onClose={onClose}
      header={header}
      body={children}
      footer={footer}
      size={size}
      alignment={alignment}
      showBackdrop={showBackdrop}
      className={className}
      zIndex={zIndex}
    />
  );
};
