import type { Meta, StoryObj } from "@storybook/react";
import { Folder, Mail, Settings } from "lucide-react";
import { useState } from "react";
import { showToast } from "../../floating/toast";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Buttons/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["primary", "secondary", "danger"],
    },
    isLoading: {
      control: "boolean",
      description: "Shows loading indicator and disables the button",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Button",
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap">
      <Button variant="default">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Danger</Button>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap">
      <Button>Normal</Button>
      <Button disabled>Disabled</Button>
      <Button isLoading>Loading</Button>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap">
      <Button>
        <Mail size={16} />
        Send Email
      </Button>
      <Button variant="secondary">
        <Folder size={16} />
        Save File
      </Button>
      <Button variant="destructive">
        <Settings size={16} />
        Settings
      </Button>
    </div>
  ),
};

export const LoadingStates: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap">
      <Button isLoading variant="default">
        Saving...
      </Button>
      <Button isLoading variant="secondary">
        Loading...
      </Button>
      <Button isLoading variant="destructive">
        Deleting...
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Loading states for all button variants. The button is automatically disabled when loading.",
      },
    },
  },
};

export const InteractiveLoading: Story = {
  render: () => {
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async () => {
      setIsLoading(true);
      showToast("Processing request...", "default");

      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setIsLoading(false);
      showToast("Operation completed!", "default");
    };

    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Button isLoading={isLoading} onClick={handleClick}>
            {isLoading ? "Processing..." : "Start Process"}
          </Button>

          <Button
            variant="secondary"
            onClick={() => setIsLoading(!isLoading)}
            disabled={isLoading}
          >
            Toggle Loading
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          Click "Start Process" to see a 2-second loading simulation
        </p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Interactive example showing how to use the isLoading prop with async operations.",
      },
    },
  },
};

export const LoadingWithIcons: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap">
      <Button isLoading>
        <Mail size={16} />
        Sending Email...
      </Button>
      <Button isLoading variant="secondary">
        <Folder size={16} />
        Saving File...
      </Button>
      <Button isLoading variant="destructive">
        <Settings size={16} />
        Updating Settings...
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Loading states with icons. The activity indicator appears before the existing content.",
      },
    },
  },
};
