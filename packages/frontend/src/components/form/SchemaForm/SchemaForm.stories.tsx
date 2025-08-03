import { faker } from "@faker-js/faker";
import { nu } from "@nubase/core";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { useSchemaForm } from "../../../hooks";
import { Button } from "../../buttons/Button/Button";
import { showPromiseToast, showToast } from "../../floating/toast";
import { SchemaForm, SchemaFormBody, SchemaFormButtonBar } from "./SchemaForm";

const meta = {
  title: "Form/SchemaForm",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Composable form components that allow flexible layout and form element placement. This replaces the legacy SchemaForm component with a more flexible composable API.",
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

// Basic contact schema
const ContactSchema = nu.object({
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
    label: "Email",
    description: "Enter your email address",
  }),
  phone: nu.string().optional().withMeta({
    label: "Phone",
    description: "Enter your phone number",
  }),
});

// Contact schema with computed metadata
const ContactWithComputedSchema = nu
  .object({
    firstName: nu.string().withMeta({
      label: "First Name",
      description: "Enter your first name",
      defaultValue: "Jane",
    }),
    lastName: nu.string().withMeta({
      label: "Last Name",
      description: "Enter your last name",
      defaultValue: "Smith",
    }),
    company: nu.string().withMeta({
      label: "Company",
      description: "Enter your company name",
    }),
    title: nu.string().optional().withMeta({
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
    name: nu.string().withMeta({
      label: "Full Name",
      description: "Enter your full name",
    }),
    email: nu.string().withMeta({
      label: "Email Address",
      description: "Enter your email address",
    }),
    message: nu.string().withMeta({
      label: "Message",
      description: "Enter your message",
    }),
    subscribe: nu.boolean().optional().withMeta({
      label: "Subscribe to newsletter",
      description: "Get updates about our services",
      defaultValue: false,
    }),
  })
  .withLayouts({
    default: {
      type: "form",
      groups: [
        {
          label: "Contact Information",
          fields: [{ name: "name" }, { name: "email" }],
        },
        {
          label: "Your Message",
          fields: [{ name: "message" }, { name: "subscribe" }],
        },
      ],
    },
  });

// Schema for error handling demo
const ErrorDemoSchema = nu.object({
  username: nu.string().withMeta({
    label: "Username",
    description: "Enter 'error' to simulate an error",
  }),
  password: nu.string().withMeta({
    label: "Password",
    description: "Enter a secure password",
  }),
  confirmPassword: nu.string().withMeta({
    label: "Confirm Password",
    description: "Re-enter your password",
  }),
});

// User schema for patch mode demo
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

export const Default: Story = {
  render: () => {
    const form = useSchemaForm({
      schema: ContactSchema,
      onSubmit: async (data) => {
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));
          console.log("Form submitted:", data);
          showToast("Contact form submitted successfully!", "success");
        } catch (error) {
          console.error("Submission error:", error);
          showToast("Failed to submit form", "error");
        }
      },
    });

    return (
      <SchemaForm form={form} className="space-y-4">
        <SchemaFormBody form={form} />
        <SchemaFormButtonBar form={form} submitText="Submit Contact" />
      </SchemaForm>
    );
  },
};

export const SeparateLayout: Story = {
  render: () => {
    const form = useSchemaForm({
      schema: ContactSchema,
      onSubmit: async (data) => {
        console.log("Form submitted with data:", data);
        showToast("Form submitted successfully!", "success");
      },
    });

    return (
      <SchemaForm form={form}>
        <div className="border border-outline rounded-lg p-4 space-y-4">
          <h2 className="text-lg font-semibold">Contact Information</h2>
          <SchemaFormBody form={form} />
        </div>
        <div className="mt-4 border-t border-outline pt-4">
          <SchemaFormButtonBar
            form={form}
            submitText="Submit Form"
            alignment="right"
          />
        </div>
      </SchemaForm>
    );
  },
};

export const WithComputed: Story = {
  render: () => {
    const form = useSchemaForm({
      schema: ContactWithComputedSchema,
      onSubmit: async (data) => {
        try {
          // Simulate API call with computed data
          await new Promise((resolve) => setTimeout(resolve, 1200));
          console.log("Contact saved:", data);
          showToast("Contact saved successfully!", "success");
        } catch (error) {
          console.error("Save error:", error);
          showToast("Failed to save contact", "error");
        }
      },
    });

    return (
      <SchemaForm form={form} className="space-y-4">
        <SchemaFormBody form={form} computedMetadata={{ debounceMs: 500 }} />
        <SchemaFormButtonBar form={form} submitText="Save Contact" />
      </SchemaForm>
    );
  },
};

export const WithLayout: Story = {
  render: () => {
    const form = useSchemaForm({
      schema: ContactWithLayoutSchema,
      onSubmit: async (data) => {
        try {
          // Simulate message sending with longer delay
          await new Promise((resolve) => setTimeout(resolve, 1500));
          console.log("Message sent:", data);
          showToast("Message sent successfully!", "success");
        } catch (error) {
          console.error("Send error:", error);
          showToast("Failed to send message", "error");
        }
      },
    });

    return (
      <SchemaForm form={form} className="space-y-4">
        <SchemaFormBody form={form} layoutName="default" />
        <SchemaFormButtonBar form={form} submitText="Send Message" />
      </SchemaForm>
    );
  },
};

export const WithErrorHandling: Story = {
  render: () => {
    const form = useSchemaForm({
      schema: ErrorDemoSchema,
      onSubmit: async (data) => {
        try {
          // Simulate API call that fails if username is 'error'
          await new Promise((resolve, reject) => {
            setTimeout(() => {
              if (data.username === "error") {
                reject(new Error("Username already taken!"));
              } else {
                resolve(data);
              }
            }, 1000);
          });
          showToast("Account created successfully!", "success");
        } catch (error) {
          console.error("Account creation error:", error);
          showToast(
            error instanceof Error ? error.message : "Failed to create account",
            "error",
          );
          throw error; // Re-throw to trigger form error state
        }
      },
    });

    return (
      <SchemaForm form={form} className="space-y-4">
        <SchemaFormBody form={form} />
        <SchemaFormButtonBar form={form} submitText="Create Account" />
      </SchemaForm>
    );
  },
};

export const WithPromiseToast: Story = {
  render: () => {
    const form = useSchemaForm({
      schema: ContactSchema,
      onSubmit: async (data) => {
        // Use showPromiseToast for automatic loading/success/error states
        const submitPromise = new Promise((resolve, reject) => {
          setTimeout(() => {
            // Randomly succeed or fail for demo purposes
            if (Math.random() > 0.5) {
              resolve({ success: true, data });
            } else {
              reject(new Error("Random failure for demo purposes"));
            }
          }, 2000);
        });

        showPromiseToast(submitPromise, (result) => ({
          message: result.success
            ? "Contact form submitted successfully!"
            : "Failed to submit contact form",
          type: result.success ? "success" : "error",
        }));
        await submitPromise;
      },
    });

    return (
      <SchemaForm form={form} className="space-y-4">
        <SchemaFormBody form={form} />
        <SchemaFormButtonBar
          form={form}
          submitText="Submit with Promise Toast"
        />
      </SchemaForm>
    );
  },
};

export const ValidationErrors: Story = {
  render: () => {
    // Schema without default values to test validation
    const testSchema = nu.object({
      firstName: nu.string().withMeta({
        label: "First Name",
        description: "Enter your first name",
      }),
      lastName: nu.string().withMeta({
        label: "Last Name",
        description: "Enter your last name",
      }),
      email: nu.string().withMeta({
        label: "Email",
        description: "Enter your email address",
      }),
    });

    const form = useSchemaForm({
      schema: testSchema,
      onSubmit: async (data) => {
        // This story focuses on form validation, so always show success
        try {
          await new Promise((resolve) => setTimeout(resolve, 500));
          console.log("Validation passed, form submitted:", data);
          showToast("Form submitted successfully!", "success");
        } catch (error) {
          console.error("Validation error:", error);
        }
      },
    });

    return (
      <SchemaForm form={form} className="space-y-4">
        <h3 className="text-lg font-semibold text-onSurface">
          Try submitting with empty required fields
        </h3>
        <SchemaFormBody form={form} />
        <SchemaFormButtonBar form={form} submitText="Test Validation" />
      </SchemaForm>
    );
  },
};

export const ImperativeValueSetting: Story = {
  render: () => {
    const form = useSchemaForm({
      schema: ContactSchema,
      onSubmit: async (data) => {
        console.log("Form submitted:", data);
        showToast("Form submitted with random values!", "success");
      },
    });

    const setRandomValues = () => {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = faker.internet.email();
      const phone = faker.phone.number();

      form.api.setFieldValue("firstName", firstName);
      form.api.setFieldValue("lastName", lastName);
      form.api.setFieldValue("email", email);
      form.api.setFieldValue("phone", phone);
    };

    return (
      <SchemaForm form={form}>
        <div className="flex gap-2 mb-4">
          <Button variant="secondary" onClick={setRandomValues}>
            Set Random Values
          </Button>
          <Button variant="secondary" onClick={() => form.api.reset()}>
            Reset Form
          </Button>
        </div>
        <SchemaFormBody form={form} />
        <SchemaFormButtonBar form={form} submitText="Submit" />
      </SchemaForm>
    );
  },
};

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
      initialValues: initialData,
    });

    return (
      <SchemaForm form={form}>
        <h3 className="text-lg font-semibold mb-4">View Mode - Read Only</h3>
        <SchemaFormBody form={form} />
      </SchemaForm>
    );
  },
};

export const PatchMode: Story = {
  render: () => {
    const [userData, _setUserData] = useState({
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@example.com",
      age: 28,
      isActive: false,
      bio: "Product manager passionate about user experience and building great products.",
    });

    const handlePatch = async (fieldName: string, value: any) => {
      showToast(`Patching ${fieldName} to: ${value}`, "info");
    };

    const form = useSchemaForm({
      schema: userSchema,
      mode: "patch",
      onSubmit: () => {},
      onPatch: handlePatch,
      initialValues: userData,
    });

    return (
      <SchemaForm form={form}>
        <h3 className="text-lg font-semibold mb-4">
          Patch Mode - Click to Edit Fields
        </h3>
        <div className="mb-4 p-4 bg-primaryContainer/10 border border-primary/20 rounded-lg">
          <p className="text-sm text-onSurface/70">
            💡 <strong>How to use:</strong> Click on any field value to edit it
            inline. Use the ✓ button to apply changes or ✕ to cancel.
          </p>
        </div>
        <SchemaFormBody form={form} />
      </SchemaForm>
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
      initialValues: userData,
    });

    return (
      <SchemaForm form={form}>
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
        <SchemaFormBody form={form} />
      </SchemaForm>
    );
  },
};
