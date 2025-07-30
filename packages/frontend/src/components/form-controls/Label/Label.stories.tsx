import type { Meta, StoryObj } from "@storybook/react";
import { Label } from "./Label";

const meta: Meta<typeof Label> = {
  title: "Form Controls/Label",
  component: Label,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default", "required", "muted"],
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Email Address",
  },
};

export const Required: Story = {
  args: {
    children: "Full Name",
    required: true,
  },
};

export const Muted: Story = {
  args: {
    children: "Optional Field",
    variant: "muted",
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <Label size="sm">Small Label</Label>
      <Label size="md">Medium Label</Label>
      <Label size="lg">Large Label</Label>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-4">
      <Label variant="default">Default Label</Label>
      <Label variant="required">Required Field</Label>
      <Label variant="muted">Muted Label</Label>
    </div>
  ),
};
