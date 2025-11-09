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
  onCancel?: () => void;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  alignment?: ModalAlignment;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "default" | "destructive";
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
  const dialogApiRef = useRef<UseDialogResult | null>(null);

  const openDialog = useCallback(
    (dialogConfig: DialogConfig) => {
      const {
        title,
        content,
        onConfirm,
        onCancel,
        size = "md",
        className = "",
        alignment = "center",
        confirmText = "Confirm",
        cancelText = "Cancel",
        confirmVariant = "default",
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

      const handleCancel = () => {
        onCancel?.();
        handleClose();
      };

      const header = title ? (
        <DialogTitle className="text-lg font-semibold text-foreground">
          {title}
        </DialogTitle>
      ) : undefined;

      const footer = onConfirm ? (
        <ButtonBar className="p-4">
          <Button variant="secondary" onClick={handleCancel}>
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

  if (!dialogApiRef.current) {
    dialogApiRef.current = {
      openDialog,
      hide,
      isOpen: false,
      DialogComponent: null,
    };
  } else {
    dialogApiRef.current.openDialog = openDialog;
    dialogApiRef.current.hide = hide;
    dialogApiRef.current.isOpen = modalIdRef.current !== null;
  }

  return dialogApiRef.current;
};
