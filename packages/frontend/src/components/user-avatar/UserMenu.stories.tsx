import type { Meta, StoryObj } from "@storybook/react";
import { UserMenu } from "./UserMenu";

const meta: Meta<typeof UserMenu> = {
  title: "User/UserMenu",
  component: UserMenu,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof UserMenu>;

export const Default: Story = {
  render: () => {
    return (
      <UserMenu
        name="admin"
        onSignOut={() => {
          console.log("Sign out clicked");
        }}
      />
    );
  },
};

export const WithEmail: Story = {
  render: () => {
    return (
      <UserMenu
        name="admin"
        email="admin@example.com"
        onSignOut={() => {
          console.log("Sign out clicked");
        }}
      />
    );
  },
};

export const TwoWordName: Story = {
  render: () => {
    return (
      <UserMenu
        name="John Doe"
        email="john.doe@example.com"
        onSignOut={() => {
          console.log("Sign out clicked");
        }}
      />
    );
  },
};

export const LongName: Story = {
  render: () => {
    return (
      <UserMenu
        name="Alexander Hamilton"
        email="alexander.hamilton@founding-fathers.com"
        onSignOut={() => {
          console.log("Sign out clicked");
        }}
      />
    );
  },
};
