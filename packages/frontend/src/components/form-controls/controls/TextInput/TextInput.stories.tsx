import type { Meta, StoryObj } from "@storybook/react";
import { TextInput } from "./TextInput";

const meta: Meta<typeof TextInput> = {
  title: "Form Controls/TextInput",
  component: TextInput,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    hasError: {
      control: "boolean",
    },
  },
  decorators: [
    (Story) => (
      <div className="w-96 p-8">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Enter your text...",
  },
};

export const WithError: Story = {
  args: {
    placeholder: "john@example.com",
    type: "email",
    hasError: true,
    value: "invalid-email",
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "Cannot type here",
    disabled: true,
  },
};

export const Types: Story = {
  render: () => (
    <div className="space-y-4">
      <TextInput type="text" placeholder="Text input" />
      <TextInput type="email" placeholder="Email input" />
      <TextInput type="password" placeholder="Password input" />
      <TextInput type="number" placeholder="Number input" />
      <TextInput type="tel" placeholder="Phone input" />
      <TextInput type="url" placeholder="URL input" />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="space-y-4">
      <TextInput placeholder="Normal state" />
      <TextInput placeholder="Error state" hasError={true} />
      <TextInput placeholder="Disabled state" disabled />
      <TextInput placeholder="Read only" readOnly value="Read only value" />
    </div>
  ),
};
