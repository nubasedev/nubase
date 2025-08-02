import { faker } from "@faker-js/faker";
import { nu } from "@nubase/core";
import type { Meta, StoryObj } from "@storybook/react";
import { useSchemaForm } from "../../../hooks";
import { Button } from "../../buttons/Button/Button";
import { showPromiseToast, showToast } from "../../floating/toast";
import { SchemaForm } from "./SchemaForm";
import { SchemaFormButtonBar } from "./SchemaFormButtonBar";

const meta = {
  title: "Form/SchemaForm",
  component: SchemaForm,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A dynamic form component that automatically renders form controls based on a provided ObjectSchema. Use with the useSchemaForm hook.",
      },
    },
  },
  tags: ["autodocs"],
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
      <div className="space-y-4">
        <SchemaForm form={form} />
        <SchemaFormButtonBar form={form} submitText="Submit Contact" />
      </div>
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
      <div className="space-y-4">
        <SchemaForm form={form} computedMetadata={{ debounceMs: 500 }} />
        <SchemaFormButtonBar form={form} submitText="Save Contact" />
      </div>
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
      <div className="space-y-4">
        <SchemaForm form={form} layoutName="default" />
        <SchemaFormButtonBar form={form} submitText="Send Message" />
      </div>
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
      <div className="space-y-4">
        <SchemaForm form={form} />
        <SchemaFormButtonBar form={form} submitText="Create Account" />
      </div>
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
      <div className="space-y-4">
        <SchemaForm form={form} />
        <SchemaFormButtonBar
          form={form}
          submitText="Submit with Promise Toast"
        />
      </div>
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
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-onSurface">
          Try submitting with empty required fields
        </h3>
        <SchemaForm form={form} />
        <SchemaFormButtonBar form={form} submitText="Test Validation" />
      </div>
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
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button variant="secondary" onClick={setRandomValues}>
            Set Random Values
          </Button>
          <Button variant="secondary" onClick={() => form.api.reset()}>
            Reset Form
          </Button>
        </div>
        <SchemaForm form={form} />
        <SchemaFormButtonBar form={form} submitText="Submit" />
      </div>
    );
  },
};
