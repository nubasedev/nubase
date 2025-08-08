import type { Meta, StoryObj } from "@storybook/react";
import { SearchTextInput } from "./SearchTextInput";

const meta: Meta<typeof SearchTextInput> = {
  title: "Form Controls/SearchTextInput",
  component: SearchTextInput,
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
    placeholder: "Search...",
  },
};

export const WithValue: Story = {
  args: {
    placeholder: "Search...",
    value: "search query",
  },
};

export const WithError: Story = {
  args: {
    placeholder: "Search...",
    hasError: true,
    value: "invalid search",
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "Search disabled...",
    disabled: true,
  },
};

export const States: Story = {
  render: () => (
    <div className="space-y-4">
      <SearchTextInput placeholder="Normal state" />
      <SearchTextInput placeholder="Error state" hasError={true} />
      <SearchTextInput placeholder="Disabled state" disabled />
      <SearchTextInput
        placeholder="Read only"
        readOnly
        value="Read only search"
      />
    </div>
  ),
};

export const NavigationSearch: Story = {
  args: {
    placeholder: "Search navigation...",
    value: "",
  },
  decorators: [
    (Story) => (
      <div className="w-64 p-4 bg-backgroundborder border-border rounded-lg">
        <Story />
      </div>
    ),
  ],
};
