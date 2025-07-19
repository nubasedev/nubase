import type { FC } from "react";
import { useRef } from "react";
import { Modal } from "../../floating/modal/Modal";
import {
  ModalNavigatorContent,
  type ModalNavigatorContentProps,
} from "./Navigator";

export type ModalNavigatorProps = {
  open: boolean;
  onClose: () => void;
} & Omit<ModalNavigatorContentProps, "onClose">;

export const ModalNavigator: FC<ModalNavigatorProps> = ({
  open,
  onClose,
  ...navigatorProps
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Modal
      open={open}
      onClose={onClose}
      alignment="top"
      size="lg"
      showBackdrop={true}
      showCloseButton={false}
      className="max-h-96"
      initialFocus={inputRef}
    >
      <ModalNavigatorContent
        ref={inputRef}
        onClose={onClose}
        {...navigatorProps}
      />
    </Modal>
  );
};
