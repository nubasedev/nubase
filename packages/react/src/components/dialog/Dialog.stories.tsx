import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Dialog } from "./Dialog";

const meta = {
  title: "Dialogs/Dialog",
  component: Dialog,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A modal dialog component built with Headless UI and styled with Tailwind CSS. Supports different sizes, optional titles, and customizable close behavior.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg", "xl", "2xl"],
    },
    showCloseButton: {
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
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Open Dialog
      </button>
      <Dialog {...args} open={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export const Default: Story = {
  render: DialogWithState,
  args: {
    title: "Dialog Title",
    children: (
      <div className="space-y-4">
        <p className="text-gray-600">
          This is a basic dialog with a title and close button. You can put any
          content here.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Confirm
          </button>
        </div>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: "A basic dialog with title, content, and action buttons.",
      },
    },
  },
};

export const WithoutTitle: Story = {
  render: DialogWithState,
  args: {
    children: (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Custom Content</h3>
        <p className="text-gray-600">
          This dialog doesn't use the built-in title prop, allowing for
          completely custom header content.
        </p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Dialog without the title prop, allowing for custom header content.",
      },
    },
  },
};

export const LargeSize: Story = {
  render: DialogWithState,
  args: {
    title: "Large Dialog",
    size: "2xl",
    children: (
      <div className="space-y-4">
        <p className="text-gray-600">
          This is a large dialog demonstrating the different size options
          available. The dialog can be sm, md, lg, xl, or 2xl.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-gray-100 p-4">
            <h4 className="font-medium">Column 1</h4>
            <p className="text-sm text-gray-600">Some content here</p>
          </div>
          <div className="rounded-lg bg-gray-100 p-4">
            <h4 className="font-medium">Column 2</h4>
            <p className="text-sm text-gray-600">More content here</p>
          </div>
        </div>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Large dialog showcasing the 2xl size option with more complex content.",
      },
    },
  },
};

export const NoCloseButton: Story = {
  render: DialogWithState,
  args: {
    title: "No Close Button",
    showCloseButton: false,
    children: (
      <div className="space-y-4">
        <p className="text-gray-600">
          This dialog doesn't show the close button. Users must use the action
          buttons to close it.
        </p>
        <div className="flex justify-end">
          <button
            type="button"
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Close Dialog
          </button>
        </div>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Dialog with the close button hidden, requiring users to use custom close actions.",
      },
    },
  },
};
