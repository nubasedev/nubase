import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "./Checkbox";

const meta: Meta<typeof Checkbox> = {
  title: "Form Controls/Checkbox",
  component: Checkbox,
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
        <Checkbox />
        <label>Unchecked</label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox defaultChecked />
        <label>Checked</label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox hasError />
        <label>Error state</label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox defaultChecked hasError />
        <label>Checked with error</label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox disabled />
        <label>Disabled</label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox defaultChecked disabled />
        <label>Checked disabled</label>
      </div>
    </div>
  ),
};
