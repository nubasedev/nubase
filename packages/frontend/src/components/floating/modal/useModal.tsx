import {
  createContext,
  type FC,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
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
    };

    setModals((prev) => [...prev, newModal]);
    return id;
  }, []);

  const closeModal = useCallback((id?: string) => {
    setModals((prev) => {
      if (id) {
        return prev.filter((modal) => modal.id !== id);
      }
      return prev.slice(0, -1);
    });
  }, []);

  const closeAllModals = useCallback(() => {
    setModals([]);
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
            open={true}
            onClose={() => handleModalClose(modal.id)}
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

  const result = useMemo(() => {
    return {
      openModal,
      closeModal,
      closeAllModals,
      modalCount: modals.length,
    };
  }, [openModal, closeModal, closeAllModals, modals.length]);

  return result;
};
