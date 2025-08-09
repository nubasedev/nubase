import { DialogTitle } from "@headlessui/react";
import type { FC, ReactNode } from "react";
import { Button } from "../../buttons/Button/Button";
import { ButtonBar } from "../../buttons/ButtonBar/ButtonBar";
import { Modal } from "../modal/Modal";
import { ModalFrameStructured } from "../modal/ModalFrameStructured";
import type { ModalAlignment } from "../modal/types";

export type DialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  alignment?: ModalAlignment;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "default" | "destructive";
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
  confirmVariant = "default",
  showBackdrop = true,
  zIndex,
}) => {
  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  const header = title ? (
    <DialogTitle className="text-lg font-semibold text-foreground">
      {title}
    </DialogTitle>
  ) : undefined;

  const footer = onConfirm ? (
    <ButtonBar className="p-4">
      <Button variant="secondary" onClick={onClose}>
        {cancelText}
      </Button>
      <Button variant={confirmVariant} onClick={handleConfirm}>
        {confirmText}
      </Button>
    </ButtonBar>
  ) : undefined;

  return (
    <Modal
      open={open}
      onClose={onClose}
      content={
        <ModalFrameStructured
          header={header}
          body={children}
          footer={footer}
          className={className}
        />
      }
      size={size}
      alignment={alignment}
      showBackdrop={showBackdrop}
      zIndex={zIndex}
    />
  );
};
