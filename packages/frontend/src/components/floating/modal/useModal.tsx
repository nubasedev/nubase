import {
  type FC,
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { Modal, type ModalProps } from "./Modal";
import { ModalStructured, type ModalStructuredProps } from "./ModalStructured";

type BaseModalConfig = {
  id: string;
  onDismiss?: () => void;
};

type RegularModalConfig = BaseModalConfig &
  Omit<ModalProps, "open" | "onClose" | "children"> & {
    type: "regular";
    component: ReactNode;
  };

type StructuredModalConfig = BaseModalConfig &
  Omit<ModalStructuredProps, "open" | "onClose"> & {
    type: "structured";
  };

type ModalConfig = RegularModalConfig | StructuredModalConfig;

type ModalContextType = {
  openModal: (config: Omit<ModalConfig, "id">) => string;
  openStructuredModal: (
    config: Omit<StructuredModalConfig, "id" | "type">,
  ) => string;
  closeModal: (id?: string) => void;
  closeAllModals: () => void;
  modals: ModalConfig[];
};

export const ModalContext = createContext<ModalContextType | null>(null);

export const ModalProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [modals, setModals] = useState<ModalConfig[]>([]);

  const openModal = useCallback((config: Omit<ModalConfig, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newModal = { ...config, id } as ModalConfig;

    setModals((prev) => [...prev, newModal]);
    return id;
  }, []);

  const openStructuredModal = useCallback(
    (config: Omit<StructuredModalConfig, "id" | "type">) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newModal: StructuredModalConfig = {
        ...config,
        id,
        type: "structured",
      };

      setModals((prev) => [...prev, newModal]);
      return id;
    },
    [],
  );

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
      if (modal?.onDismiss) {
        modal.onDismiss();
      }
      closeModal(modalId);
    },
    [closeModal, modals],
  );

  return (
    <ModalContext.Provider
      value={{
        openModal,
        openStructuredModal,
        closeModal,
        closeAllModals,
        modals,
      }}
    >
      {children}
      {modals.map((modal, index) => {
        if (modal.type === "structured") {
          const { id, type, onDismiss, ...modalProps } = modal;
          return (
            <ModalStructured
              key={id}
              open={true}
              onClose={() => handleModalClose(id)}
              zIndex={50 + index}
              {...modalProps}
            />
          );
        }
        const { id, type, onDismiss, component, ...modalProps } = modal;
        return (
          <Modal
            key={id}
            open={true}
            onClose={() => handleModalClose(id)}
            zIndex={50 + index}
            {...modalProps}
          >
            {component}
          </Modal>
        );
      })}
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
    (
      component: ReactNode,
      options?: Omit<RegularModalConfig, "id" | "component" | "type">,
    ) => {
      return contextOpenModal({
        type: "regular",
        component,
        ...options,
      } as Omit<ModalConfig, "id">);
    },
    [contextOpenModal],
  );

  const result = useMemo(() => {
    return {
      openModal,
      closeModal,
      closeAllModals,
      modalCount: context.modals.length,
    };
  }, [openModal, closeModal, closeAllModals, context.modals.length]);

  return result;
};
