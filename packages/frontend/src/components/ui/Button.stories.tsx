import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta = {
  title: "Shad/Button",
  component: Button,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Component description",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    // argTypes configuration
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    // default args
  },
  render: () => {
    return <Button>Default Button</Button>;
  },
};
