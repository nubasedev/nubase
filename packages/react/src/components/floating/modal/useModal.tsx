import {
  type FC,
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import { Modal, type ModalProps } from "./Modal";

type ModalConfig = Omit<ModalProps, "open" | "onClose" | "children"> & {
  component: ReactNode;
  id: string;
};

type ModalContextType = {
  openModal: (config: Omit<ModalConfig, "id">) => string;
  closeModal: (id?: string) => void;
  closeAllModals: () => void;
  modals: ModalConfig[];
};

const ModalContext = createContext<ModalContextType | null>(null);

export const ModalProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [modals, setModals] = useState<ModalConfig[]>([]);

  const openModal = useCallback((config: Omit<ModalConfig, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newModal: ModalConfig = { ...config, id };

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
      closeModal(modalId);
    },
    [closeModal],
  );

  return (
    <ModalContext.Provider
      value={{ openModal, closeModal, closeAllModals, modals }}
    >
      {children}
      {modals.map((modal, index) => (
        <Modal
          key={modal.id}
          open={true}
          onClose={() => handleModalClose(modal.id)}
          zIndex={50 + index}
          {...modal}
        >
          {modal.component}
        </Modal>
      ))}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }

  const { openModal: contextOpenModal, closeModal, closeAllModals } = context;

  const openModal = useCallback(
    (component: ReactNode, options?: Omit<ModalConfig, "id" | "component">) => {
      return contextOpenModal({ component, ...options });
    },
    [contextOpenModal],
  );

  return {
    openModal,
    closeModal,
    closeAllModals,
    modalCount: context.modals.length,
  };
};
