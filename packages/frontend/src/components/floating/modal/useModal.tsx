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
    const newModal: ModalInstance = {
      id,
      config,
      open: true,
    };

    setModals((prev) => [...prev, newModal]);
    return id;
  }, []);

  const closeModal = useCallback((id?: string) => {
    setModals((prev) => {
      if (id) {
        return prev.map((modal) =>
          modal.id === id ? { ...modal, open: false } : modal,
        );
      }
      let lastOpenIdx = -1;
      for (let i = prev.length - 1; i >= 0; i--) {
        if (prev[i]?.open) {
          lastOpenIdx = i;
          break;
        }
      }
      if (lastOpenIdx === -1) return prev;
      return prev.map((modal, i) =>
        i === lastOpenIdx ? { ...modal, open: false } : modal,
      );
    });
  }, []);

  const removeModal = useCallback((id: string) => {
    setModals((prev) => prev.filter((modal) => modal.id !== id));
  }, []);

  const closeAllModals = useCallback(() => {
    setModals((prev) => prev.map((modal) => ({ ...modal, open: false })));
  }, []);

  const handleModalClose = useCallback(
    (modalId: string) => {
      const modal = modals.find((m) => m.id === modalId);
      if (modal?.config.onDismiss) {
        modal.config.onDismiss();
      }
      closeModal(modalId);
    },
    [closeModal, modals],
  );

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
            onClose={() => handleModalClose(modal.id)}
            onExited={() => removeModal(modal.id)}
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
