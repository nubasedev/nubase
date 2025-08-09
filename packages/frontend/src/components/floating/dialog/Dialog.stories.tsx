import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../../buttons/Button/Button";
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
    showBackdrop: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Dialog>;

export default meta;

type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  render: () => {
    const { openDialog } = useDialog();

    return (
      <Button
        onClick={() => {
          openDialog({
            title: "Confirm Action",
            content: (
              <div className="space-y-4">
                <p className="text-text-muted">
                  Are you sure you want to proceed with this action? This cannot
                  be undone.
                </p>
              </div>
            ),
            onConfirm: () => {
              console.log("Confirmed!");
            },
          });
        }}
      >
        Open Dialog
      </Button>
    );
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
  render: () => {
    const { openDialog } = useDialog();

    return (
      <Button
        onClick={() => {
          openDialog({
            title: "Delete Item",
            confirmText: "Delete",
            confirmVariant: "destructive",
            content: (
              <div className="space-y-4">
                <p className="text-text-muted">
                  This will permanently delete the selected item. This action
                  cannot be undone.
                </p>
              </div>
            ),
            onConfirm: () => {
              console.log("Item deleted!");
            },
          });
        }}
      >
        Open Delete Dialog
      </Button>
    );
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
  render: () => {
    const { openDialog } = useDialog();

    return (
      <Button
        onClick={() => {
          openDialog({
            title: "Save Changes",
            confirmText: "Save",
            cancelText: "Discard",
            content: (
              <div className="space-y-4">
                <p className="text-text-muted">
                  You have unsaved changes. Do you want to save them before
                  leaving?
                </p>
              </div>
            ),
            onConfirm: () => {
              console.log("Changes saved!");
            },
          });
        }}
      >
        Open Save Dialog
      </Button>
    );
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
    const { openDialog } = useDialog();

    return (
      <Button
        onClick={() => {
          openDialog({
            title: "Information",
            content: (
              <div className="space-y-4">
                <p className="text-text-muted">
                  This is an informational dialog without confirmation buttons.
                </p>
              </div>
            ),
            // No onConfirm means no action buttons
          });
        }}
      >
        Open Info Dialog
      </Button>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Dialog without onConfirm prop, showing only informational content.",
      },
    },
  },
};

const UseDialogExample = () => {
  const { openDialog: showConfirmDialog } = useDialog();
  const { openDialog: showDeleteDialog } = useDialog();
  const { openDialog: showInfoDialog } = useDialog();

  const handleSaveDocument = () => {
    showConfirmDialog({
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
    showDeleteDialog({
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
      confirmVariant: "destructive",
      onConfirm: () => {
        console.log("Item deleted!");
        // Simulate delete action
      },
    });
  };

  const showInfo = () => {
    showInfoDialog({
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
        <Button variant="destructive" onClick={handleDeleteItem}>
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
    </div>
  );
};

export const UseDialogHook: Story = {
  render: () => <UseDialogExample />,
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
  const { openDialog: showDialog1 } = useDialog();
  const { openDialog: showDialog2 } = useDialog();
  const { openDialog: showDialog3 } = useDialog();

  const openFirstDialog = () => {
    showDialog1({
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
      confirmText: "Confirm",
      onConfirm: () => console.log("First dialog confirmed"),
    });
  };

  const openSecondDialog = () => {
    showDialog2({
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
      confirmText: "Confirm",
      onConfirm: () => console.log("Second dialog confirmed"),
    });
  };

  const openThirdDialog = () => {
    showDialog3({
      title: "Third Dialog",
      content: (
        <p className="text-text-muted">
          This is the third dialog. Dialogs stack properly on top of each other.
        </p>
      ),
      confirmText: "Confirm",
      confirmVariant: "destructive",
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
    </div>
  );
};

export const StackedDialogs: Story = {
  render: () => <StackedDialogsExample />,
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates dialog stacking functionality where multiple dialogs can be open simultaneously.",
      },
    },
  },
};
