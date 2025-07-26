import type { ReactElement } from "react";

export type ModalSize = "sm" | "md" | "lg" | "xl" | "2xl" | "full";
export type ModalAlignment = "center" | "top";

export type BaseModalFrameProps = {
  onClose: () => void;
};

export type ModalConfig = {
  content: ReactElement<BaseModalFrameProps>;
  size?: ModalSize;
  alignment?: ModalAlignment;
  showBackdrop?: boolean;
  zIndex?: number;
  onDismiss?: () => void;
};

export type ModalInstance = {
  id: string;
  config: ModalConfig;
};
