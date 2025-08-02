import { nu } from "@nubase/core";
import type { Meta, StoryObj } from "@storybook/react";
import { useSchemaForm } from "../../../hooks";
import { showToast } from "../../floating/toast";

const meta = {
  title: "Form/SchemaFormComposable",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Composable form components that allow flexible layout and form element placement.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-3xl p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;

type Story = StoryObj;

// Basic test schema
const TestSchema = nu.object({
  name: nu.string().withMeta({
    label: "Name",
    description: "Enter your name",
  }),
  email: nu.string().withMeta({
    label: "Email",
    description: "Enter your email",
  }),
});

export const BasicComposable: Story = {
  render: () => {
    const form = useSchemaForm({
      schema: TestSchema,
      onSubmit: async (data) => {
        console.log("Form submitted with data:", data);
        showToast("Form submitted successfully!", "success");
      },
    });

    return (
      <form.Form className="space-y-4">
        <form.Body />
        <form.ButtonBar submitText="Submit" />
      </form.Form>
    );
  },
};

export const SeparateButtonBar: Story = {
  render: () => {
    const form = useSchemaForm({
      schema: TestSchema,
      onSubmit: async (data) => {
        console.log("Form submitted with data:", data);
        showToast("Form submitted successfully!", "success");
      },
    });

    return (
      <form.Form>
        <div className="border border-outline rounded-lg p-4 space-y-4">
          <h2 className="text-lg font-semibold">Form Body</h2>
          <form.Body />
        </div>
        <div className="mt-4 border-t border-outline pt-4">
          <form.ButtonBar submitText="Submit Form" alignment="right" />
        </div>
      </form.Form>
    );
  },
};
