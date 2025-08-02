import { nu } from "@nubase/core";
import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";
import { useSchemaForm } from "../../../hooks";
import { showToast } from "../../floating/toast";
import { SchemaForm } from "./SchemaForm";

const meta: Meta<typeof SchemaForm> = {
  title: "Form/SchemaForm - Patch Mode",
  component: SchemaForm,
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Create a sample schema for the stories
const userSchema = nu.object({
  firstName: nu
    .string()
    .withMetadata({ label: "First Name", description: "Your first name" }),
  lastName: nu
    .string()
    .withMetadata({ label: "Last Name", description: "Your last name" }),
  email: nu
    .string()
    .withMetadata({ label: "Email", description: "Your email address" }),
  age: nu
    .number()
    .withMetadata({ label: "Age", description: "Your age in years" }),
  isActive: nu.boolean().withMetadata({
    label: "Active",
    description: "Whether the user is active",
  }),
  bio: nu
    .string()
    .optional()
    .withMetadata({ label: "Bio", description: "Tell us about yourself" }),
});

export const ViewMode: Story = {
  render: () => {
    const initialData = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      age: 30,
      isActive: true,
      bio: "I'm a software developer with 10 years of experience in web development. I love working with React and TypeScript.",
    };

    const form = useSchemaForm({
      schema: userSchema,
      mode: "view",
      onSubmit: () => {},
    });

    // Pre-populate the form with data
    useEffect(() => {
      form.api.setFieldValue("firstName", initialData.firstName);
      form.api.setFieldValue("lastName", initialData.lastName);
      form.api.setFieldValue("email", initialData.email);
      form.api.setFieldValue("age", initialData.age);
      form.api.setFieldValue("isActive", initialData.isActive);
      form.api.setFieldValue("bio", initialData.bio);
    }, [form.api]);

    return (
      <div className="max-w-2xl">
        <h3 className="text-lg font-semibold mb-4">View Mode - Read Only</h3>
        <SchemaForm form={form} />
      </div>
    );
  },
};

export const PatchMode: Story = {
  render: () => {
    const [userData, setUserData] = useState({
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@example.com",
      age: 28,
      isActive: false,
      bio: "Product manager passionate about user experience and building great products.",
    });

    const handlePatch = async (fieldName: string, value: any) => {
      showToast(`Patching ${fieldName} to: ${value}`, "info");

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      setUserData((prev) => ({
        ...prev,
        [fieldName]: value,
      }));
    };

    const form = useSchemaForm({
      schema: userSchema,
      mode: "patch",
      onSubmit: () => {},
      onPatch: handlePatch,
    });

    // Pre-populate the form with current data
    useEffect(() => {
      for (const [key, value] of Object.entries(userData)) {
        form.api.setFieldValue(key as keyof typeof userData, value);
      }
    }, [form.api, userData]);

    return (
      <div className="max-w-2xl">
        <h3 className="text-lg font-semibold mb-4">
          Patch Mode - Click to Edit Fields
        </h3>
        <div className="mb-4 p-4 bg-primaryContainer/10 border border-primary/20 rounded-lg">
          <p className="text-sm text-onSurface/70">
            💡 <strong>How to use:</strong> Click on any field value to edit it
            inline. Use the ✓ button to apply changes or ✕ to cancel.
          </p>
        </div>
        <SchemaForm form={form} />
      </div>
    );
  },
};

export const PatchModeWithValidation: Story = {
  render: () => {
    const [userData, setUserData] = useState({
      firstName: "Bob",
      lastName: "Johnson",
      email: "invalid-email", // Invalid email to show validation
      age: -5, // Invalid age to show validation
      isActive: true,
      bio: "",
    });

    const handlePatch = async (fieldName: string, value: any) => {
      showToast(`Validating patch for ${fieldName}`, "info");

      // Simulate validation - reject invalid emails
      if (fieldName === "email" && !value.includes("@")) {
        throw new Error("Please enter a valid email address");
      }

      // Simulate validation - reject negative ages
      if (fieldName === "age" && value < 0) {
        throw new Error("Age must be a positive number");
      }

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      setUserData((prev) => ({
        ...prev,
        [fieldName]: value,
      }));
    };

    const form = useSchemaForm({
      schema: userSchema,
      mode: "patch",
      onSubmit: () => {},
      onPatch: handlePatch,
    });

    // Pre-populate the form with current data
    useEffect(() => {
      for (const [key, value] of Object.entries(userData)) {
        form.api.setFieldValue(key as keyof typeof userData, value);
      }
    }, [form.api, userData]);

    return (
      <div className="max-w-2xl">
        <h3 className="text-lg font-semibold mb-4">
          Patch Mode with Validation
        </h3>
        <div className="mb-4 p-4 bg-errorContainer/10 border border-error/20 rounded-lg">
          <p className="text-sm text-onSurface/70">
            ⚠️ <strong>Try editing:</strong> The email field has an invalid
            value, and age is negative. Try fixing them to see validation in
            action.
          </p>
        </div>
        <SchemaForm form={form} />
      </div>
    );
  },
};
