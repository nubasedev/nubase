import type { Meta, StoryObj } from "@storybook/react";
import {
  IconFolder,
  IconMail,
  IconRocket,
  IconSettings,
} from "@tabler/icons-react";
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
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="danger">Danger</Button>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap">
      <Button>Normal</Button>
      <Button disabled>Disabled</Button>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap">
      <Button>
        <IconMail size={16} />
        Send Email
      </Button>
      <Button variant="secondary">
        <IconFolder size={16} />
        Save File
      </Button>
      <Button variant="danger">
        <IconSettings size={16} />
        Settings
      </Button>
    </div>
  ),
};
