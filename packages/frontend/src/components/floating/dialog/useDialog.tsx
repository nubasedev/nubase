import { DialogTitle } from "@headlessui/react";
import { type ReactNode, useCallback, useRef } from "react";
import { Button } from "../../buttons/Button/Button";
import { ButtonBar } from "../../buttons/ButtonBar/ButtonBar";
import { ModalFrameStructured } from "../modal/ModalFrameStructured";
import type { ModalAlignment } from "../modal/types";
import { useModal } from "../modal/useModal";

type DialogConfig = {
  title?: string;
  content: ReactNode;
  onConfirm?: () => void;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  alignment?: ModalAlignment;
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
  const { openModal, closeModal } = useModal();
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
        <ButtonBar className="p-4">
          <Button variant="secondary" onClick={handleClose}>
            {cancelText}
          </Button>
          <Button variant={confirmVariant} onClick={handleConfirm}>
            {confirmText}
          </Button>
        </ButtonBar>
      ) : undefined;

      modalIdRef.current = openModal({
        content: (
          <ModalFrameStructured
            header={header}
            body={content}
            footer={footer}
            className={className}
          />
        ),
        size,
        alignment,
        showBackdrop,
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
