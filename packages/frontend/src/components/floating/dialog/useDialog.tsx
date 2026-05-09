import { DialogTitle } from "@headlessui/react";
import { type ReactNode, useCallback, useRef } from "react";
import { Button } from "../../buttons/Button/Button";
import { ButtonBar } from "../../buttons/ButtonBar/ButtonBar";
import { ModalFrameStructured } from "../modal/ModalFrameStructured";
import type { ModalAlignment } from "../modal/types";
import { useModal } from "../modal/useModal";

export type DialogConfig = {
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

export type DialogConfirmConfig = Omit<DialogConfig, "onConfirm" | "onCancel">;

export type UseDialogResult = {
  openDialog: (config: DialogConfig) => void;
  /**
   * Promise-returning confirmation dialog. Resolves true on confirm, false on
   * cancel or dismissal (backdrop click / Escape).
   */
  confirm: (config: DialogConfirmConfig) => Promise<boolean>;
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

      // Single-shot guard so a click on Confirm/Cancel doesn't also fire
      // the modal's onDismiss callback when closeModal triggers it.
      let resolved = false;

      const handleClose = () => {
        if (modalIdRef.current) {
          closeModal(modalIdRef.current);
          modalIdRef.current = null;
        }
      };

      const handleConfirm = () => {
        if (resolved) return;
        resolved = true;
        onConfirm?.();
        handleClose();
      };

      const handleCancel = () => {
        if (resolved) return;
        resolved = true;
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
        // Backdrop click / Escape dismissal goes through here; treat it as cancel.
        onDismiss: () => {
          if (resolved) return;
          resolved = true;
          onCancel?.();
        },
      });
    },
    [openModal, closeModal],
  );

  const confirm = useCallback(
    (config: DialogConfirmConfig) =>
      new Promise<boolean>((resolve) => {
        openDialog({
          ...config,
          onConfirm: () => resolve(true),
          onCancel: () => resolve(false),
        });
      }),
    [openDialog],
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
      confirm,
      hide,
      isOpen: false,
      DialogComponent: null,
    };
  } else {
    dialogApiRef.current.openDialog = openDialog;
    dialogApiRef.current.confirm = confirm;
    dialogApiRef.current.hide = hide;
    dialogApiRef.current.isOpen = modalIdRef.current !== null;
  }

  return dialogApiRef.current;
};
