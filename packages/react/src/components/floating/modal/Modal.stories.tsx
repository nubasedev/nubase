import type { Meta, StoryObj } from "@storybook/react";
import {
  IconCode,
  IconCommand,
  IconFile,
  IconFolder,
  IconSearch,
} from "@tabler/icons-react";
import { useState } from "react";
import { Button } from "../../buttons/Button/Button";
import { ButtonBar } from "../../buttons/ButtonBar/ButtonBar";
import { Modal } from "./Modal";
import { ModalProvider, useModal } from "./useModal";

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
    showCloseButton: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Modal>;

export default meta;

type Story = StoryObj<typeof Modal>;

const BasicModalExample = (args: any) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <Modal {...args} open={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export const Default: Story = {
  render: BasicModalExample,
  args: {
    children: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text">Default Modal</h3>
        <p className="text-text-muted">
          This is a basic modal centered on the screen with a backdrop.
        </p>
        <ButtonBar>
          <Button variant="secondary">Cancel</Button>
          <Button>Confirm</Button>
        </ButtonBar>
      </div>
    ),
  },
};

export const TopAligned: Story = {
  render: BasicModalExample,
  args: {
    alignment: "top",
    children: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text">Top Aligned Modal</h3>
        <p className="text-text-muted">
          This modal appears at the top of the screen, similar to VS Code's
          command palette.
        </p>
      </div>
    ),
  },
};

export const NoBackdrop: Story = {
  render: BasicModalExample,
  args: {
    showBackdrop: false,
    showCloseButton: true,
    children: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text">No Backdrop</h3>
        <p className="text-text-muted">
          This modal has no backdrop, allowing interaction with content behind
          it.
        </p>
      </div>
    ),
  },
};

const StackingModalExample = () => {
  const { openModal, closeModal, modalCount } = useModal();

  const openFirstModal = () => {
    openModal(
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text">First Modal</h3>
        <p className="text-text-muted">This is the first modal in the stack.</p>
        <Button variant="secondary" onClick={openSecondModal}>
          Open Second Modal
        </Button>
        <div className="text-sm text-text-muted">Modal count: {modalCount}</div>
      </div>,
    );
  };

  const openSecondModal = () => {
    openModal(
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text">Second Modal</h3>
        <p className="text-text-muted">
          This is the second modal, stacked on top.
        </p>
        <Button variant="secondary" onClick={openThirdModal}>
          Open Third Modal
        </Button>
        <div className="text-sm text-text-muted">Modal count: {modalCount}</div>
      </div>,
    );
  };

  const openThirdModal = () => {
    openModal(
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text">Third Modal</h3>
        <p className="text-text-muted">
          This is the third modal. Click outside any modal to close them one by
          one.
        </p>
        <div className="text-sm text-text-muted">Modal count: {modalCount}</div>
      </div>,
    );
  };

  return (
    <div className="space-y-4">
      <Button onClick={openFirstModal}>Open Stacking Modal</Button>
      <p className="text-sm text-text-muted">
        Click the button to open a modal, then click buttons inside to stack
        more modals. Click outside any modal to close them one by one.
      </p>
    </div>
  );
};

export const StackingModals: Story = {
  render: () => (
    <ModalProvider>
      <StackingModalExample />
    </ModalProvider>
  ),
};

const VSCodeCommandPaletteExample = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const commands = [
    {
      icon: IconFile,
      name: "File: New File",
      description: "Create a new file",
      shortcut: "Cmd+N",
    },
    {
      icon: IconFolder,
      name: "File: Open Folder",
      description: "Open a folder",
      shortcut: "Cmd+O",
    },
    {
      icon: IconSearch,
      name: "Search: Find in Files",
      description: "Search across files",
      shortcut: "Cmd+Shift+F",
    },
    {
      icon: IconCode,
      name: "View: Toggle Terminal",
      description: "Show/hide terminal",
      shortcut: "Cmd+`",
    },
    {
      icon: IconCommand,
      name: "Command Palette",
      description: "Show all commands",
      shortcut: "Cmd+Shift+P",
    },
  ];

  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cmd.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <>
      <div className="space-y-4">
        <Button
          variant="secondary"
          onClick={() => setIsOpen(true)}
          className="bg-surface-hover text-text hover:bg-surface"
        >
          <IconCommand className="h-4 w-4" />
          Open Command Palette
          <span className="text-xs text-text-muted">Cmd+P</span>
        </Button>
        <p className="text-sm text-text-muted">
          Click to open a VS Code-style command palette modal at the top of the
          screen.
        </p>
      </div>

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        alignment="top"
        size="lg"
        className="max-h-96"
      >
        <div className="space-y-3">
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-placeholder" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type a command or search..."
              className="w-full rounded-md border border-border py-2 pl-10 pr-4 text-sm text-text bg-surface focus:border-border-focus focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
          </div>

          <div className="max-h-64 overflow-y-auto">
            {filteredCommands.length > 0 ? (
              <div className="space-y-1">
                {filteredCommands.map((cmd, index) => (
                  <button
                    key={index}
                    type="button"
                    className="flex items-center space-x-3 rounded-md px-3 py-2 hover:bg-surface-hover cursor-pointer w-full text-left"
                    onClick={() => setIsOpen(false)}
                  >
                    <cmd.icon className="h-4 w-4 text-text-muted" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-text">
                        {cmd.name}
                      </div>
                      <div className="text-xs text-text-muted">
                        {cmd.description}
                      </div>
                    </div>
                    <div className="text-xs text-text-muted">
                      {cmd.shortcut}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-text-muted">
                No commands found for "{searchTerm}"
              </div>
            )}
          </div>

          <div className="border-t border-border pt-2 text-xs text-text-muted">
            Press <kbd className="rounded border border-border px-1">Esc</kbd>{" "}
            to close
          </div>
        </div>
      </Modal>
    </>
  );
};

export const VSCodeCommandPalette: Story = {
  render: VSCodeCommandPaletteExample,
  parameters: {
    docs: {
      description: {
        story:
          "A VS Code-style command palette that appears at the top of the screen with search functionality.",
      },
    },
  },
};
