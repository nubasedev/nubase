import { nu } from "@nubase/core";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { useSchemaForm } from "../../../hooks";
import { Button } from "../../buttons/Button/Button";
import { showToast } from "../toast";
import { ModalSchemaForm } from "./ModalSchemaForm";
import { createModalSchemaForm } from "./createModalSchemaForm";
import { useModalSchemaForm } from "./useModalSchemaForm";

const meta = {
  title: "Floating/ModalSchemaForm",
  component: ModalSchemaForm,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A specialized modal component for displaying schema-driven forms with automatic form management, validation, and submission handling.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ModalSchemaForm>;

export default meta;

type Story = StoryObj<typeof ModalSchemaForm>;

// Schema for demonstrating modal forms
const LongFormSchema = nu.object({
  firstName: nu.string().withMeta({
    label: "First Name",
    description: "Enter your first name",
    defaultValue: "John",
  }),
  lastName: nu.string().withMeta({
    label: "Last Name",
    description: "Enter your last name",
    defaultValue: "Doe",
  }),
  email: nu.string().withMeta({
    label: "Email Address",
    description: "Enter your email address",
  }),
  phone: nu.string().optional().withMeta({
    label: "Phone Number",
    description: "Enter your phone number",
  }),
  company: nu.string().withMeta({
    label: "Company",
    description: "Enter your company name",
  }),
  jobTitle: nu.string().withMeta({
    label: "Job Title",
    description: "Enter your job title",
  }),
  address: nu.string().withMeta({
    label: "Street Address",
    description: "Enter your street address",
  }),
  city: nu.string().withMeta({
    label: "City",
    description: "Enter your city",
  }),
  state: nu.string().withMeta({
    label: "State/Province",
    description: "Enter your state or province",
  }),
  zipCode: nu.string().withMeta({
    label: "ZIP/Postal Code",
    description: "Enter your ZIP or postal code",
  }),
  country: nu.string().withMeta({
    label: "Country",
    description: "Enter your country",
    defaultValue: "United States",
  }),
  notes: nu.string().optional().withMeta({
    label: "Additional Notes",
    description: "Any additional information you'd like to share",
  }),
});

export const Default: Story = {
  render: () => {
    const { openModalSchemaForm, closeModal } = useModalSchemaForm();

    // useSchemaForm must be called at the component level, not inside event handlers
    const form = useSchemaForm({
      schema: LongFormSchema,
      onSubmit: async (data) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log("Form submitted:", data);
        showToast("Contact information saved successfully!", "success");
        closeModal(); // Close modal after successful submit
      },
    });

    return (
      <Button
        onClick={() => {
          openModalSchemaForm({
            title: "Contact Information Form",
            submitText: "Save Contact",
            form,
            size: "lg",
          });
        }}
      >
        Open Schema Form Modal
      </Button>
    );
  },
};
