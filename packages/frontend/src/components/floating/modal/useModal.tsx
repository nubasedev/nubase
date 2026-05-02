import {
  createContext,
  type FC,
  type ReactNode,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { Modal } from "./Modal";
import type { ModalConfig, ModalInstance } from "./types";

type ModalContextType = {
  openModal: (config: ModalConfig) => string;
  closeModal: (id?: string) => void;
  closeAllModals: () => void;
  modals: ModalInstance[];
};

export const ModalContext = createContext<ModalContextType | null>(null);

export const ModalProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [modals, setModals] = useState<ModalInstance[]>([]);

  const openModal = useCallback((config: ModalConfig) => {
    const id = Math.random().toString(36).substr(2, 9);
    setModals((prev) => [...prev, { id, config, open: true }]);
    return id;
  }, []);

  const closeModal = useCallback((id?: string) => {
    setModals((prev) => {
      const targetId = id ?? prev[prev.length - 1]?.id;
      if (!targetId) return prev;
      const target = prev.find((m) => m.id === targetId);
      target?.config.onDismiss?.();
      return prev.filter((m) => m.id !== targetId);
    });
  }, []);

  const closeAllModals = useCallback(() => {
    setModals((prev) => {
      for (const modal of prev) modal.config.onDismiss?.();
      return [];
    });
  }, []);

  return (
    <ModalContext.Provider
      value={{
        openModal,
        closeModal,
        closeAllModals,
        modals,
      }}
    >
      {children}
      {modals.map((modal, index) => {
        const { content, ...modalProps } = modal.config;
        return (
          <Modal
            key={modal.id}
            open={modal.open}
            onClose={() => closeModal(modal.id)}
            content={content}
            zIndex={(modalProps.zIndex || 50) + index}
            {...modalProps}
          />
        );
      })}
    </ModalContext.Provider>
  );
};

export type UseModalResult = {
  openModal: (config: ModalConfig) => string;
  closeModal: (id?: string) => void;
  closeAllModals: () => void;
  modalCount: number;
};

export const useModal = (): UseModalResult => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }

  const { openModal, closeModal, closeAllModals, modals } = context;
  const modalApiRef = useRef<UseModalResult | null>(null);

  if (!modalApiRef.current) {
    modalApiRef.current = {
      openModal,
      closeModal,
      closeAllModals,
      modalCount: modals.length,
    };
  } else {
    modalApiRef.current.openModal = openModal;
    modalApiRef.current.closeModal = closeModal;
    modalApiRef.current.closeAllModals = closeAllModals;
    modalApiRef.current.modalCount = modals.length;
  }

  return modalApiRef.current;
};
