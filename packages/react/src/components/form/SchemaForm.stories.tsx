import { nu } from "@nubase/core";
import type { Meta, StoryObj } from "@storybook/react";
import { SchemaForm } from "./SchemaForm";

const meta = {
  title: "Form/SchemaForm",
  component: SchemaForm,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A dynamic form component that automatically renders form controls based on a provided ObjectSchema.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    onSubmit: { action: "submitted" },
  },
} satisfies Meta<typeof SchemaForm<any>>;

export default meta;

type Story = StoryObj<typeof SchemaForm<any>>;

// Basic contact schema
const ContactSchema = nu.object({
  firstName: nu.string().meta({
    label: "First Name",
    description: "Enter your first name",
    defaultValue: "John",
  }),
  lastName: nu.string().meta({
    label: "Last Name",
    description: "Enter your last name",
    defaultValue: "Doe",
  }),
  email: nu.string().meta({
    label: "Email",
    description: "Enter your email address",
  }),
  phone: nu.string().meta({
    label: "Phone",
    description: "Enter your phone number",
  }),
});

// Contact schema with computed metadata
const ContactWithComputedSchema = nu
  .object({
    firstName: nu.string().meta({
      label: "First Name",
      description: "Enter your first name",
      defaultValue: "Jane",
    }),
    lastName: nu.string().meta({
      label: "Last Name",
      description: "Enter your last name",
      defaultValue: "Smith",
    }),
    company: nu.string().meta({
      label: "Company",
      description: "Enter your company name",
    }),
    title: nu.string().meta({
      label: "Job Title",
      description: "Enter your job title",
    }),
  })
  .withComputed({
    title: {
      label: async (obj) => `Title at ${obj.company || "Company"}`,
    },
  });

// Contact schema with layout configuration
const ContactWithLayoutSchema = nu
  .object({
    name: nu.string().meta({
      label: "Full Name",
      description: "Enter your full name",
    }),
    email: nu.string().meta({
      label: "Email Address",
      description: "Enter your email address",
    }),
    message: nu.string().meta({
      label: "Message",
      description: "Enter your message",
    }),
    urgent: nu.boolean().meta({
      label: "Urgent",
      description: "Is this message urgent?",
    }),
  })
  .withLayouts({
    default: {
      type: "form",
      groups: [
        {
          label: "Contact Information",
          fields: [
            {
              name: "name",
              size: 6,
            },
            {
              name: "email",
              size: 6,
            },
          ],
        },
        {
          label: "Message Details",
          fields: [
            {
              name: "message",
              size: 12,
            },
            {
              name: "urgent",
              size: 3,
            },
          ],
        },
      ],
    },
  });

export const Default: Story = {
  args: {
    schema: ContactSchema,
    submitText: "Submit Contact",
    className: "w-96",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Basic contact form with first name, last name, email, and phone fields.",
      },
    },
  },
};

export const WithComputed: Story = {
  args: {
    schema: ContactWithComputedSchema,
    submitText: "Save Contact",
    className: "w-96",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Contact form with computed metadata that dynamically updates the job title label based on company.",
      },
    },
  },
};

export const WithLayout: Story = {
  args: {
    schema: ContactWithLayoutSchema,
    submitText: "Send Message",
    className: "w-full max-w-2xl",
    layoutName: "default",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Contact form using a custom layout that groups fields into Contact Information and Message Details sections.",
      },
    },
  },
};
