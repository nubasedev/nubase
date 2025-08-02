import { useContext, useMemo } from "react";
import { ModalContext } from "./useModal";

export const useModalStructured = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModalStructured must be used within a ModalProvider");
  }

  const { openStructuredModal, closeModal, closeAllModals } = context;

  const result = useMemo(() => {
    return {
      openModal: openStructuredModal,
      closeModal,
      closeAllModals,
      modalCount: context.modals.length,
    };
  }, [openStructuredModal, closeModal, closeAllModals, context.modals.length]);

  return result;
};
