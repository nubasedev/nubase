import { nu } from "@nubase/core";
import type { Meta, StoryObj } from "@storybook/react";
import { useSchemaForm } from "../../../hooks";
import { showToast } from "../../floating/toast";
import { SchemaFormButtonBar } from "./SchemaFormButtonBar";

const meta = {
  title: "Form/SchemaFormButtonBar",
  component: SchemaFormButtonBar,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A button bar component specifically designed for schema forms that automatically handles form state and submission. Shows submit button with appropriate loading states and disabling logic.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    alignment: {
      control: "select",
      options: ["left", "center", "right"],
    },
    submitText: {
      control: "text",
    },
    isComputing: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof SchemaFormButtonBar>;

export default meta;

type Story = StoryObj<typeof SchemaFormButtonBar>;

// Simple schema for demonstrations
const SimpleSchema = nu.object({
  name: nu.string().withMeta({
    label: "Name",
    description: "Enter your name",
  }),
  email: nu.string().withMeta({
    label: "Email",
    description: "Enter your email address",
  }),
});

export const Default: Story = {
  render: () => {
    const form = useSchemaForm({
      schema: SimpleSchema,
      onSubmit: async (data) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        showToast("Form submitted successfully!", "success");
        console.log("Submitted:", data);
      },
    });

    return (
      <div className="w-80 space-y-4">
        <div className="text-sm text-onSurfaceVariant">
          Default button bar with right alignment
        </div>
        <SchemaFormButtonBar form={form} />
      </div>
    );
  },
};
