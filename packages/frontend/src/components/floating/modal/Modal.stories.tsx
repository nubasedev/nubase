import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../../buttons/Button/Button";
import { ButtonBar } from "../../buttons/ButtonBar/ButtonBar";
import { showToast } from "../toast";
import { Modal } from "./Modal";
import { useModal } from "./useModal";
import { useModalStructured } from "./useModalStructured";

const meta = {
  title: "Floating/Modal",
  component: Modal,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A flexible modal component with support for different alignments, backdrop control, and stacking. Built with Headless UI and styled with Tailwind CSS.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    alignment: {
      control: "select",
      options: ["center", "top"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "xl", "2xl", "full"],
    },
    showBackdrop: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Modal>;

export default meta;

type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  render: () => {
    const { openModal } = useModal();

    const handleOpenModal = () => {
      openModal(
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-onSurface">
            Default Modal
          </h3>
          <p className="text-onSurfaceVariant">
            This is a basic modal centered on the screen with a backdrop.
          </p>
          <ButtonBar>
            <Button variant="secondary">Cancel</Button>
            <Button>Confirm</Button>
          </ButtonBar>
        </div>,
      );
    };

    return <Button onClick={handleOpenModal}>Open Modal</Button>;
  },
};

export const TopAligned: Story = {
  render: () => {
    const { openModal } = useModal();

    const handleOpenModal = () => {
      openModal(
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-onSurface">
            Top Aligned Modal
          </h3>
          <p className="text-onSurfaceVariant">
            This modal appears at the top of the screen, similar to VS Code's
            command palette.
          </p>
        </div>,
        { alignment: "top" },
      );
    };

    return <Button onClick={handleOpenModal}>Open Top Aligned Modal</Button>;
  },
};

export const StackingModals: Story = {
  render: () => {
    const { openModal, modalCount } = useModal();

    const openFirstModal = () => {
      openModal(
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-onSurface">First Modal</h3>
          <p className="text-onSurfaceVariant">
            This is the first modal in the stack.
          </p>
          <Button variant="secondary" onClick={openSecondModal}>
            Open Second Modal
          </Button>
          <div className="text-sm text-onSurfaceVariant">
            Modal count: {modalCount}
          </div>
        </div>,
        {
          onDismiss: () => console.log("First modal (level 1) dismissed"),
        },
      );
    };

    const openSecondModal = () => {
      openModal(
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-onSurface">Second Modal</h3>
          <p className="text-onSurfaceVariant">
            This is the second modal, stacked on top.
          </p>
          <Button variant="secondary" onClick={openThirdModal}>
            Open Third Modal
          </Button>
          <div className="text-sm text-onSurfaceVariant">
            Modal count: {modalCount}
          </div>
        </div>,
        {
          onDismiss: () => console.log("Second modal (level 2) dismissed"),
        },
      );
    };

    const openThirdModal = () => {
      openModal(
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-onSurface">Third Modal</h3>
          <p className="text-onSurfaceVariant">
            This is the third modal. Click outside any modal to close them one
            by one.
          </p>
          <div className="text-sm text-onSurfaceVariant">
            Modal count: {modalCount}
          </div>
        </div>,
        {
          onDismiss: () => console.log("Third modal (level 3) dismissed"),
        },
      );
    };

    return (
      <div className="space-y-4">
        <Button onClick={openFirstModal}>Open Stacking Modal</Button>
        <p className="text-sm text-onSurfaceVariant">
          Click the button to open a modal, then click buttons inside to stack
          more modals. Click outside any modal to close them one by one.
        </p>
      </div>
    );
  },
};
