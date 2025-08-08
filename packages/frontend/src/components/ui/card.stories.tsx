import type { Meta, StoryObj } from "@storybook/react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

const meta = {
  title: "Shad/Card",
  component: Card,
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
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    // default args
  },
  parameters: {
    docs: {
      description: {
        story: "Default story description",
      },
    },
  },
  render: () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Default Title</CardTitle>
          <CardDescription>Default Description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is the default content of the card.</p>
        </CardContent>
        <CardFooter>
          <CardAction>Default Action</CardAction>
        </CardFooter>
      </Card>
    );
  },
};
