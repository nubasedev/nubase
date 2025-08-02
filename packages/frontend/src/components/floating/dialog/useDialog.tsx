import { DialogTitle } from "@headlessui/react";
import { type ReactNode, useCallback, useRef } from "react";
import { Button } from "../../buttons/Button/Button";
import { ButtonBar } from "../../buttons/ButtonBar/ButtonBar";
import type { ModalStructuredAlignment } from "../modal/ModalStructured";
import { useModalStructured } from "../modal/useModalStructured";

type DialogConfig = {
  title?: string;
  content: ReactNode;
  onConfirm?: () => void;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  alignment?: ModalStructuredAlignment;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "primary" | "danger";
  showBackdrop?: boolean;
  zIndex?: number;
};

export type UseDialogResult = {
  openDialog: (config: DialogConfig) => void;
  hide: () => void;
  isOpen: boolean;
  DialogComponent: null;
};

export const useDialog = (): UseDialogResult => {
  const { openModal, closeModal } = useModalStructured();
  const modalIdRef = useRef<string | null>(null);

  const openDialog = useCallback(
    (dialogConfig: DialogConfig) => {
      const {
        title,
        content,
        onConfirm,
        size = "md",
        className = "",
        alignment = "center",
        confirmText = "Confirm",
        cancelText = "Cancel",
        confirmVariant = "primary",
        showBackdrop = true,
        zIndex,
      } = dialogConfig;

      const handleClose = () => {
        if (modalIdRef.current) {
          closeModal(modalIdRef.current);
          modalIdRef.current = null;
        }
      };

      const handleConfirm = () => {
        onConfirm?.();
        handleClose();
      };

      const header = title ? (
        <DialogTitle className="text-lg font-semibold text-onSurface">
          {title}
        </DialogTitle>
      ) : undefined;

      const footer = onConfirm ? (
        <ButtonBar>
          <Button variant="secondary" onClick={handleClose}>
            {cancelText}
          </Button>
          <Button variant={confirmVariant} onClick={handleConfirm}>
            {confirmText}
          </Button>
        </ButtonBar>
      ) : undefined;

      modalIdRef.current = openModal({
        header,
        body: content,
        footer,
        size,
        alignment,
        showBackdrop,
        className,
        zIndex,
      });
    },
    [openModal, closeModal],
  );

  const hide = useCallback(() => {
    if (modalIdRef.current) {
      closeModal(modalIdRef.current);
      modalIdRef.current = null;
    }
  }, [closeModal]);

  return {
    openDialog,
    hide,
    isOpen: modalIdRef.current !== null,
    DialogComponent: null, // No longer needed with modal context
  };
};
