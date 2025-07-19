import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "../../buttons/Button/Button";
import { AppNavigator } from "./AppNavigator";

const meta: Meta<typeof AppNavigator> = {
  title: "Floating/AppNavigator",
  component: AppNavigator,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    open: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="space-y-4">
        <Button onClick={() => setIsOpen(true)}>Open App Navigator</Button>
        <p className="text-sm text-text-muted">
          Press Cmd+K (Mac) or Ctrl+K (Windows/Linux) to open the app navigator
        </p>
        <AppNavigator open={isOpen} onClose={() => setIsOpen(false)} />
      </div>
    );
  },
};

export const Open: Story = {
  args: {
    open: true,
    onClose: () => {},
  },
};