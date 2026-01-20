import type { Meta, StoryObj } from "@storybook/react";
import { Toggle } from "./Toggle";

const meta: Meta<typeof Toggle> = {
  title: "Form Controls/Toggle",
  component: Toggle,
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
      <div className="p-8">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
};

export const WithError: Story = {
  args: {
    hasError: true,
  },
};

export const CheckedWithError: Story = {
  args: {
    defaultChecked: true,
    hasError: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const CheckedDisabled: Story = {
  args: {
    defaultChecked: true,
    disabled: true,
  },
};

export const States: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Toggle />
        <label>Unchecked</label>
      </div>
      <div className="flex items-center space-x-2">
        <Toggle defaultChecked />
        <label>Checked</label>
      </div>
      <div className="flex items-center space-x-2">
        <Toggle hasError />
        <label>Error state</label>
      </div>
      <div className="flex items-center space-x-2">
        <Toggle defaultChecked hasError />
        <label>Checked with error</label>
      </div>
      <div className="flex items-center space-x-2">
        <Toggle disabled />
        <label>Disabled</label>
      </div>
      <div className="flex items-center space-x-2">
        <Toggle defaultChecked disabled />
        <label>Checked disabled</label>
      </div>
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Toggle id="airplane-mode" />
      <label htmlFor="airplane-mode" className="text-sm font-medium">
        Airplane Mode
      </label>
    </div>
  ),
};
