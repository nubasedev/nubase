import { faker } from "@faker-js/faker";
import { nu } from "@nubase/core";
import type { Meta, StoryObj } from "@storybook/react";
import { useRef } from "react";
import { Button } from "../buttons/Button/Button";
import { showPromiseToast, showToast } from "../floating/toast";
import { SchemaForm, type SchemaFormRef } from "./SchemaForm";

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
  firstName: nu.string().withMeta({
    label: "First Name",
    description: "Enter your first name",
    defaultValue: "John",
    required: true,
  }),
  lastName: nu.string().withMeta({
    label: "Last Name",
    description: "Enter your last name",
    defaultValue: "Doe",
    required: true,
  }),
  email: nu.string().withMeta({
    label: "Email",
    description: "Enter your email address",
    required: true,
  }),
  phone: nu.string().withMeta({
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
      required: true,
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
    title: nu.string().withMeta({
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
    urgent: nu.boolean().withMeta({
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
    onSubmit: async (data) => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log("Form submitted:", data);
        showToast("Contact information submitted successfully!", "success");
      } catch (error) {
        console.error("Form submission error:", error);
        showToast(
          "Failed to submit contact information. Please try again.",
          "error",
        );
      }
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Basic contact form with first name, last name, email, and phone fields. Shows success toast on submission.",
      },
    },
  },
};

export const WithComputed: Story = {
  args: {
    schema: ContactWithComputedSchema,
    submitText: "Save Contact",
    className: "w-96",
    onSubmit: async (data) => {
      try {
        // Simulate API call with computed data
        await new Promise((resolve) => setTimeout(resolve, 1200));
        console.log("Contact saved:", data);
        showToast(
          `Contact saved successfully! Welcome ${data.firstName}!`,
          "success",
        );
      } catch (error) {
        console.error("Save error:", error);
        showToast(
          "Failed to save contact. Please check your information and try again.",
          "error",
        );
      }
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Contact form with computed metadata that dynamically updates the job title label based on company. Shows personalized success toast.",
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
    onSubmit: async (data) => {
      try {
        // Simulate message sending with longer delay
        await new Promise((resolve) => setTimeout(resolve, 1500));
        console.log("Message sent:", data);
        showToast(
          data.urgent
            ? "Urgent message sent successfully! We'll respond within 1 hour."
            : "Message sent successfully! We'll get back to you soon.",
          "success",
        );
      } catch (error) {
        console.error("Message send error:", error);
        showToast("Failed to send message. Please try again later.", "error");
      }
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Contact form using a custom layout that groups fields into Contact Information and Message Details sections. Shows conditional success messages based on urgency.",
      },
    },
  },
};

// Schema for error demonstration
const ErrorDemoSchema = nu.object({
  username: nu.string().withMeta({
    label: "Username",
    description: "Enter a username (use 'error' to trigger failure)",
    required: true,
  }),
  email: nu.string().withMeta({
    label: "Email",
    description: "Enter your email address",
    required: true,
  }),
});

export const WithErrorHandling: Story = {
  args: {
    schema: ErrorDemoSchema,
    submitText: "Create Account",
    className: "w-96",
    onSubmit: async (data) => {
      try {
        // Simulate API call that fails if username is 'error'
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (data.username.toLowerCase() === "error") {
              reject(new Error("Username already exists"));
            } else {
              resolve(data);
            }
          }, 1000);
        });
        console.log("Account created:", data);
        showToast(
          `Account created successfully! Welcome, ${data.username}!`,
          "success",
        );
      } catch (error) {
        console.error("Account creation error:", error);
        showToast(
          error instanceof Error
            ? error.message
            : "Failed to create account. Please try again.",
          "error",
        );
      }
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates error handling with toasts. Enter 'error' as username to trigger a failure toast, or any other username for success.",
      },
    },
  },
};

export const WithPromiseToast: Story = {
  args: {
    schema: ContactSchema,
    submitText: "Submit with Promise Toast",
    className: "w-96",
    onSubmit: async (data) => {
      // Use showPromiseToast for automatic loading/success/error states
      const submitPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
          // Randomly succeed or fail for demo purposes
          if (Math.random() > 0.3) {
            resolve(data);
          } else {
            reject(new Error("Random network error"));
          }
        }, 2000);
      });

      showPromiseToast(
        submitPromise,
        (result) => ({
          message: result.success
            ? "Contact submitted successfully!"
            : result.error?.message || "Failed to submit contact",
          type: result.success ? "success" : "error",
        }),
        {
          loadingText: "Submitting contact...",
        },
      );
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Uses showPromiseToast for automatic loading states. Shows loading toast while submitting, then success or error based on random outcome.",
      },
    },
  },
};

export const ValidationErrors: Story = {
  args: {
    schema: ContactSchema,
    submitText: "Test Validation",
    className: "w-96",
    onSubmit: async (data) => {
      // This story focuses on form validation, so always show success
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        console.log("Validation passed, form submitted:", data);
        showToast(
          "All validations passed! Form submitted successfully.",
          "success",
        );
      } catch (error) {
        showToast("Unexpected error occurred.", "error");
      }
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates form validation. Try submitting with empty required fields to see validation errors, then fill them out to see success toast.",
      },
    },
  },
};

export const ImperativeValueSetting: Story = {
  render: (args) => {
    const formRef = useRef<SchemaFormRef<typeof ContactSchema>>(null);

    const setRandomValues = () => {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = faker.internet.email();
      const phone = faker.phone.number();

      if (formRef.current) {
        formRef.current.setFieldValue("firstName", firstName);
        formRef.current.setFieldValue("lastName", lastName);
        formRef.current.setFieldValue("email", email);
        formRef.current.setFieldValue("phone", phone);
        showToast("Random values set successfully!", "success");
      }
    };

    const clearForm = () => {
      if (formRef.current) {
        formRef.current.setFieldValue("firstName", "");
        formRef.current.setFieldValue("lastName", "");
        formRef.current.setFieldValue("email", "");
        formRef.current.setFieldValue("phone", "");
        showToast("Form cleared!", "info");
      }
    };

    const resetToDefaults = () => {
      if (formRef.current) {
        formRef.current.reset();
        showToast("Form reset to defaults!", "info");
      }
    };

    return (
      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" onClick={setRandomValues}>
            Set Random Values
          </Button>
          <Button variant="secondary" onClick={clearForm}>
            Clear Form
          </Button>
          <Button variant="secondary" onClick={resetToDefaults}>
            Reset to Defaults
          </Button>
        </div>
        <SchemaForm ref={formRef} {...args} />
      </div>
    );
  },
  args: {
    schema: ContactSchema,
    submitText: "Submit Contact",
    className: "w-96",
    onSubmit: async (data) => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log("Form submitted:", data);
        showToast("Contact information submitted successfully!", "success");
      } catch (error) {
        console.error("Form submission error:", error);
        showToast(
          "Failed to submit contact information. Please try again.",
          "error",
        );
      }
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates imperative form value setting using buttons. Click 'Set Random Values' to populate the form with random data, 'Clear Form' to empty all fields, or 'Reset to Defaults' to restore default values using the form API.",
      },
    },
  },
};
