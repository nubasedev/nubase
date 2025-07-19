import type { Meta, StoryObj } from "@storybook/react";
import { DynamicIcon } from "./DynamicIcon";

const meta: Meta<typeof DynamicIcon> = {
  title: "Icons/DynamicIcon",
  component: DynamicIcon,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    name: {
      control: { type: "text" },
      description: "Full icon name (e.g., 'IconRocket', 'IconStarFilled')",
    },
    size: {
      control: { type: "number" },
      defaultValue: 16,
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "IconRocket",
    size: 24,
  },
};

export const CommonIcons: Story = {
  render: () => (
    <div className="flex gap-4 items-center flex-wrap">
      <div className="flex flex-col items-center gap-2">
        <DynamicIcon name="IconMail" size={24} />
        <span className="text-sm">IconMail</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <DynamicIcon name="IconFolder" size={24} />
        <span className="text-sm">IconFolder</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <DynamicIcon name="IconSettings" size={24} />
        <span className="text-sm">IconSettings</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <DynamicIcon name="IconRocket" size={24} />
        <span className="text-sm">IconRocket</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <DynamicIcon name="IconHeart" size={24} />
        <span className="text-sm">IconHeart</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <DynamicIcon name="IconStarFilled" size={24} />
        <span className="text-sm">IconStarFilled</span>
      </div>
    </div>
  ),
};

export const DifferentSizes: Story = {
  render: () => (
    <div className="flex gap-4 items-center flex-wrap">
      <DynamicIcon name="IconRocket" size={12} />
      <DynamicIcon name="IconRocket" size={16} />
      <DynamicIcon name="IconRocket" size={24} />
      <DynamicIcon name="IconRocket" size={32} />
      <DynamicIcon name="IconRocket" size={48} />
    </div>
  ),
};

export const InvalidIcon: Story = {
  args: {
    name: "NonExistentIcon",
    size: 24,
  },
};

export const LoadingStates: Story = {
  render: () => (
    <div className="flex gap-4 items-center flex-wrap">
      <div className="flex flex-col items-center gap-2">
        <DynamicIcon name="IconDownload" size={24} />
        <span className="text-sm">Valid Icon</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <DynamicIcon name="InvalidIconName" size={24} />
        <span className="text-sm">Invalid Icon</span>
      </div>
    </div>
  ),
};
