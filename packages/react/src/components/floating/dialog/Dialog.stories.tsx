import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "../../buttons/Button/Button";
import { ModalProvider } from "../modal/useModal";
import { Dialog } from "./Dialog";
import { useDialog } from "./useDialog";

const meta = {
  title: "Floating/Dialog",
  component: Dialog,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A dialog component built on top of the Modal system. Dialogs are special modals with confirm/cancel actions and customizable variants for different use cases.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg", "xl", "2xl"],
    },
    alignment: {
      control: "select",
      options: ["center", "top"],
    },
    confirmVariant: {
      control: "select",
      options: ["default", "destructive"],
    },
    showCloseButton: {
      control: "boolean",
    },
    showBackdrop: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Dialog>;

export default meta;

type Story = StoryObj<typeof Dialog>;

const DialogWithState = (args: any) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Dialog</Button>
      <Dialog
        {...args}
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={() => {
          console.log("Confirmed!");
          setIsOpen(false);
        }}
      />
    </>
  );
};

export const Default: Story = {
  render: DialogWithState,
  args: {
    title: "Confirm Action",
    children: (
      <div className="space-y-4">
        <p className="text-text-muted">
          Are you sure you want to proceed with this action? This cannot be
          undone.
        </p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: "A basic confirmation dialog with confirm and cancel buttons.",
      },
    },
  },
};

export const DangerAction: Story = {
  render: DialogWithState,
  args: {
    title: "Delete Item",
    confirmText: "Delete",
    confirmVariant: "danger",
    children: (
      <div className="space-y-4">
        <p className="text-text-muted">
          This will permanently delete the selected item. This action cannot be
          undone.
        </p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: "A danger dialog for destructive actions like deletion.",
      },
    },
  },
};

export const CustomButtons: Story = {
  render: DialogWithState,
  args: {
    title: "Save Changes",
    confirmText: "Save",
    cancelText: "Discard",
    children: (
      <div className="space-y-4">
        <p className="text-text-muted">
          You have unsaved changes. Do you want to save them before leaving?
        </p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: "Dialog with custom button text for specific actions.",
      },
    },
  },
};

export const NoConfirmAction: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Info Dialog</Button>
        <Dialog
          open={isOpen}
          onClose={() => setIsOpen(false)}
          title="Information"
        >
          <div className="space-y-4">
            <p className="text-text-muted">
              This is an informational dialog without confirmation buttons. It
              only has the close button.
            </p>
          </div>
        </Dialog>
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Dialog without onConfirm prop, showing only content with close functionality.",
      },
    },
  },
};

const UseDialogExample = () => {
  const confirmDialog = useDialog();
  const deleteDialog = useDialog();
  const infoDialog = useDialog();

  const handleSaveDocument = () => {
    confirmDialog.show({
      title: "Save Document",
      content: (
        <p className="text-text-muted">
          Do you want to save your changes to the document?
        </p>
      ),
      confirmText: "Save",
      cancelText: "Don't Save",
      onConfirm: () => {
        console.log("Document saved!");
        // Simulate save action
      },
    });
  };

  const handleDeleteItem = () => {
    deleteDialog.show({
      title: "Delete Item",
      content: (
        <div className="space-y-2">
          <p className="text-text-muted">
            This will permanently delete the selected item.
          </p>
          <p className="text-sm font-medium text-red-600">
            This action cannot be undone!
          </p>
        </div>
      ),
      confirmText: "Delete",
      confirmVariant: "danger",
      onConfirm: () => {
        console.log("Item deleted!");
        // Simulate delete action
      },
    });
  };

  const showInfo = () => {
    infoDialog.show({
      title: "Information",
      content: (
        <p className="text-text-muted">
          This is an informational dialog created with useDialog hook.
        </p>
      ),
      // No onConfirm means no action buttons
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleSaveDocument}>Save Document</Button>
        <Button variant="danger" onClick={handleDeleteItem}>
          Delete Item
        </Button>
        <Button variant="secondary" onClick={showInfo}>
          Show Info
        </Button>
      </div>

      <p className="text-sm text-text-muted">
        Click the buttons to see different dialog types using the useDialog
        hook. Check the browser console for confirmation actions.
      </p>

      {confirmDialog.DialogComponent}
      {deleteDialog.DialogComponent}
      {infoDialog.DialogComponent}
    </div>
  );
};

export const UseDialogHook: Story = {
  render: () => (
    <ModalProvider>
      <UseDialogExample />
    </ModalProvider>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Using the useDialog hook for programmatic dialog management. This example shows different dialog types and how to handle confirmations.",
      },
    },
  },
};

const StackedDialogsExample = () => {
  const dialog1 = useDialog();
  const dialog2 = useDialog();
  const dialog3 = useDialog();

  const openFirstDialog = () => {
    dialog1.show({
      title: "First Dialog",
      content: (
        <div className="space-y-4">
          <p className="text-text-muted">
            This is the first dialog in the stack.
          </p>
          <Button variant="secondary" onClick={openSecondDialog}>
            Open Second Dialog
          </Button>
        </div>
      ),
      confirmText: "Close First",
      onConfirm: () => console.log("First dialog confirmed"),
    });
  };

  const openSecondDialog = () => {
    dialog2.show({
      title: "Second Dialog",
      content: (
        <div className="space-y-4">
          <p className="text-text-muted">
            This is the second dialog, stacked on top.
          </p>
          <Button variant="secondary" onClick={openThirdDialog}>
            Open Third Dialog
          </Button>
        </div>
      ),
      confirmText: "Close Second",
      onConfirm: () => console.log("Second dialog confirmed"),
    });
  };

  const openThirdDialog = () => {
    dialog3.show({
      title: "Third Dialog",
      content: (
        <p className="text-text-muted">
          This is the third dialog. Dialogs stack properly on top of each other.
        </p>
      ),
      confirmText: "Close Third",
      confirmVariant: "danger",
      onConfirm: () => console.log("Third dialog confirmed"),
    });
  };

  return (
    <div className="space-y-4">
      <Button onClick={openFirstDialog}>Open Stacking Dialog</Button>

      <p className="text-sm text-text-muted">
        Click to open dialogs that can stack on top of each other. Each dialog
        can open another dialog while remaining open itself.
      </p>

      {dialog1.DialogComponent}
      {dialog2.DialogComponent}
      {dialog3.DialogComponent}
    </div>
  );
};

export const StackedDialogs: Story = {
  render: () => (
    <ModalProvider>
      <StackedDialogsExample />
    </ModalProvider>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates dialog stacking functionality where multiple dialogs can be open simultaneously.",
      },
    },
  },
};
