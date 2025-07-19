import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "../../buttons/Button/Button";
import { ModalNavigator } from "./ModalNavigator";
import { Navigator } from "./Navigator";

const meta: Meta<typeof Navigator> = {
  title: "Floating/Navigator",
  component: Navigator,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    return (
      <div className="max-w-lg">
        <Navigator />
      </div>
    );
  },
};

export const WithModal: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="space-y-4">
        <Button onClick={() => setIsOpen(true)}>Open App Navigator</Button>
        <p className="text-sm text-text-muted">
          Press Cmd+K (Mac) or Ctrl+K (Windows/Linux) to open the app navigator
        </p>
        <ModalNavigator open={isOpen} onClose={() => setIsOpen(false)} />
      </div>
    );
  },
};
