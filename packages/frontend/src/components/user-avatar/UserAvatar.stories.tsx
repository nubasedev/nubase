import type { Meta, StoryObj } from "@storybook/react";
import { UserAvatar } from "./UserAvatar";

const meta: Meta<typeof UserAvatar> = {
  title: "User/UserAvatar",
  component: UserAvatar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof UserAvatar>;

export const Default: Story = {
  render: () => {
    return <UserAvatar name="admin" />;
  },
};

export const TwoWordName: Story = {
  render: () => {
    return <UserAvatar name="John Doe" />;
  },
};

export const LongName: Story = {
  render: () => {
    return <UserAvatar name="Alexander Hamilton" />;
  },
};

export const SingleCharacterName: Story = {
  render: () => {
    return <UserAvatar name="A" />;
  },
};
