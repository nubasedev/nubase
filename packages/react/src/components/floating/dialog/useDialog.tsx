import { type ReactNode, useCallback, useState } from "react";
import { Dialog, type DialogProps } from "./Dialog";

type DialogConfig = Omit<
  DialogProps,
  "open" | "onClose" | "onConfirm" | "children"
> & {
  title?: string;
  content: ReactNode;
  onConfirm?: () => void;
};

export const useDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<DialogConfig | null>(null);

  const show = useCallback((dialogConfig: DialogConfig) => {
    setConfig(dialogConfig);
    setIsOpen(true);
  }, []);

  const hide = useCallback(() => {
    setIsOpen(false);
    // Clear config after animation completes
    setTimeout(() => setConfig(null), 300);
  }, []);

  const handleConfirm = useCallback(() => {
    config?.onConfirm?.();
    hide();
  }, [config, hide]);

  const DialogComponent = config ? (
    <Dialog
      {...config}
      open={isOpen}
      onClose={hide}
      onConfirm={config.onConfirm ? handleConfirm : undefined}
    >
      {config.content}
    </Dialog>
  ) : null;

  return {
    show,
    hide,
    isOpen,
    DialogComponent,
  };
};
