import { faker } from "@faker-js/faker";
import { nu } from "@nubase/core";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { useSchemaForm } from "../../../hooks";
import { Button } from "../../buttons/Button/Button";
import { showToast } from "../../floating/toast";
import { SchemaForm } from "./SchemaForm";
import { SchemaFormBody } from "./SchemaFormBody";
import { SchemaFormButtonBar } from "./SchemaFormButtonBar";
import { SchemaFormValidationErrors } from "./SchemaFormValidationErrors";

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
const _ErrorDemoSchema = nu.object({
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
      onSubmit: async () => {
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));
          showToast("Contact form submitted successfully!", "default");
        } catch (error) {
          console.error("Submission error:", error);
          showToast("Failed to submit form", "error");
        }
      },
    });

    return (
      <SchemaForm form={form} className="space-y-4">
        <SchemaFormBody form={form} />
        <SchemaFormValidationErrors form={form} />
        <SchemaFormButtonBar form={form} submitText="Submit Contact" />
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
          showToast("Contact saved successfully!", "default");
        } catch (error) {
          console.error("Save error:", error);
          showToast("Failed to save contact", "error");
        }
      },
    });

    return (
      <SchemaForm form={form} className="space-y-4">
        <SchemaFormBody form={form} computedMetadata={{ debounceMs: 500 }} />
        <SchemaFormValidationErrors form={form} />
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
          showToast("Message sent successfully!", "default");
        } catch (error) {
          console.error("Send error:", error);
          showToast("Failed to send message", "error");
        }
      },
    });

    return (
      <SchemaForm form={form} className="space-y-4">
        <SchemaFormBody form={form} layoutName="default" />
        <SchemaFormValidationErrors form={form} />
        <SchemaFormButtonBar form={form} submitText="Send Message" />
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
        showToast("Form submitted with random values!", "default");
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
      <SchemaForm form={form} className="space-y-4">
        <div className="flex gap-2 mb-4">
          <Button variant="secondary" onClick={setRandomValues}>
            Set Random Values
          </Button>
          <Button variant="secondary" onClick={() => form.api.reset()}>
            Reset Form
          </Button>
        </div>
        <SchemaFormBody form={form} />
        <SchemaFormValidationErrors form={form} />
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
      showToast(`Patching ${fieldName} to: ${value}`, "default");
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
        <div className="mb-4 p-4 bg-secondary/10 border border-primary/20 rounded-lg">
          <p className="text-sm text-foreground70">
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
      showToast(`Validating patch for ${fieldName}`, "default");

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
        <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-foreground70">
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

// Helper function to simulate async validation delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Field-level validation stories
export const FieldSyncValidation: Story = {
  name: "Field - Sync Validation",
  render: () => {
    const schema = nu.object({
      email: nu.string().withMetadata({
        label: "Email",
        validateOnBlur: (value: string) => {
          if (!value.includes("@")) {
            return "Email must contain @ symbol";
          }
          return undefined;
        },
        validateOnSubmit: (value: string) => {
          if (!value.includes("@") || !value.includes(".")) {
            return "Please enter a valid email address";
          }
          return undefined;
        },
      }),
      name: nu.string().withMetadata({
        label: "Name",
        validateOnSubmit: (value: string) => {
          if (value.length < 2) {
            return "Name must be at least 2 characters";
          }
          return undefined;
        },
      }),
    });

    const form = useSchemaForm({
      schema,
      onSubmit: async () => {
        showToast("Form submitted successfully!", "default");
      },
    });

    return (
      <SchemaForm form={form} className="space-y-4">
        <SchemaFormBody form={form} />
        <SchemaFormValidationErrors form={form} />
        <SchemaFormButtonBar form={form} />
      </SchemaForm>
    );
  },
};

export const FieldAsyncValidation: Story = {
  name: "Field - Async Validation",
  render: () => {
    const schema = nu.object({
      username: nu.string().withMetadata({
        label: "Username",
        validateOnBlurAsync: async (value: string) => {
          if (!value) return undefined;

          await delay(1000); // Simulate API call

          // Simulate checking if username is taken
          const takenUsernames = ["admin", "user", "test"];
          if (takenUsernames.includes(value.toLowerCase())) {
            return "Username is already taken";
          }
          return undefined;
        },
        validateOnSubmitAsync: async (value: string) => {
          await delay(500);

          if (value.length < 3) {
            return "Username must be at least 3 characters";
          }
          if (!/^[a-zA-Z0-9_]+$/.test(value)) {
            return "Username can only contain letters, numbers, and underscores";
          }
          return undefined;
        },
      }),
      email: nu.string().withMetadata({
        label: "Email",
        validateOnSubmitAsync: async (value: string) => {
          await delay(800);

          // Simulate checking if email is already registered
          const registeredEmails = ["test@example.com", "admin@example.com"];
          if (registeredEmails.includes(value.toLowerCase())) {
            return "Email is already registered";
          }
          return undefined;
        },
      }),
    });

    const form = useSchemaForm({
      schema,
      onSubmit: async () => {
        showToast("Form submitted successfully!", "default");
      },
    });

    return (
      <SchemaForm form={form} className="space-y-4">
        <SchemaFormBody form={form} />
        <SchemaFormValidationErrors form={form} />
        <SchemaFormButtonBar form={form} />
      </SchemaForm>
    );
  },
};

export const FieldCombinedValidation: Story = {
  name: "Field - Combined Sync + Async Validation",
  render: () => {
    const schema = nu.object({
      password: nu.string().withMetadata({
        label: "Password",
        description:
          "Password will be checked for strength on blur and uniqueness on submit",
        // Sync validation for immediate feedback
        validateOnBlur: (value: string) => {
          if (!value) return undefined;

          if (value.length < 8) {
            return "Password must be at least 8 characters";
          }
          if (!/[A-Z]/.test(value)) {
            return "Password must contain at least one uppercase letter";
          }
          if (!/[0-9]/.test(value)) {
            return "Password must contain at least one number";
          }
          return undefined;
        },
        // Async validation for server-side checks
        validateOnBlurAsync: async (value: string) => {
          if (!value || value.length < 8) return undefined; // Skip if basic validation fails

          await delay(1200);

          // Simulate checking against common passwords
          const commonPasswords = ["password123", "123456789", "qwerty123"];
          if (commonPasswords.includes(value.toLowerCase())) {
            return "This password is too common. Please choose a stronger one.";
          }
          return undefined;
        },
        // Additional submit validation
        validateOnSubmit: (value: string) => {
          if (!/[!@#$%^&*]/.test(value)) {
            return "Password should contain at least one special character";
          }
          return undefined;
        },
      }),
      confirmPassword: nu.string().withMetadata({
        label: "Confirm Password",
        validateOnSubmit: (value: string) => {
          // Note: In a real app, you'd compare with the password field
          // For this demo, we'll just check it's not empty
          if (!value) {
            return "Please confirm your password";
          }
          return undefined;
        },
      }),
    });

    const form = useSchemaForm({
      schema,
      onSubmit: async (data) => {
        console.log("Form submitted:", data);
        showToast("Form submitted successfully!", "default");
      },
    });

    return (
      <SchemaForm form={form} className="space-y-4">
        <SchemaFormBody form={form} />
        <SchemaFormValidationErrors form={form} />
        <SchemaFormButtonBar form={form} />
      </SchemaForm>
    );
  },
};

// Form-level validation stories
export const FormSyncValidation: Story = {
  name: "Form - Sync Validation",
  render: () => {
    const schema = nu
      .object({
        firstName: nu.string().withMetadata({ label: "First Name" }),
        lastName: nu.string().withMetadata({ label: "Last Name" }),
      })
      .withMetadata({
        validateOnSubmit: (data) => {
          // Cross-field validation
          if (data.firstName === data.lastName) {
            return "First name and last name cannot be the same";
          }
          return undefined;
        },
      });

    const form = useSchemaForm({
      schema,
      onSubmit: async () => {
        showToast("Form submitted successfully!", "default");
      },
    });

    return (
      <SchemaForm form={form} className="space-y-4">
        <SchemaFormBody form={form} />
        <SchemaFormValidationErrors form={form} />
        <SchemaFormButtonBar form={form} />
      </SchemaForm>
    );
  },
};

export const FormAsyncValidation: Story = {
  name: "Form - Async Validation",
  render: () => {
    const schema = nu
      .object({
        companyName: nu.string().withMetadata({ label: "Company Name" }),
        website: nu.string().withMetadata({ label: "Website" }),
        industry: nu.string().withMetadata({ label: "Industry" }),
      })
      .withMetadata({
        validateOnSubmitAsync: async (data: any) => {
          await delay(1500); // Simulate API call to validate company

          // Simulate checking if company registration is valid
          if (data.companyName && data.website) {
            const forbiddenCompanies = ["test corp", "fake company"];
            if (forbiddenCompanies.includes(data.companyName.toLowerCase())) {
              return "This company name is not allowed for registration";
            }

            if (data.website && !data.website.startsWith("http")) {
              return "Website URL must start with http:// or https://";
            }
          }

          return undefined;
        },
      });

    const form = useSchemaForm({
      schema,
      onSubmit: async (data) => {
        console.log("Form submitted:", data);
        showToast("Form submitted successfully!", "default");
      },
    });

    return (
      <SchemaForm form={form} className="space-y-4">
        <SchemaFormBody form={form} />
        <SchemaFormValidationErrors form={form} />
        <SchemaFormButtonBar form={form} />
      </SchemaForm>
    );
  },
};

export const FormCombinedValidation: Story = {
  name: "Form - Combined Sync + Async Validation",
  render: () => {
    const schema = nu
      .object({
        teamName: nu.string().withMetadata({ label: "Team Name" }),
        memberCount: nu.number().withMetadata({ label: "Number of Members" }),
        budget: nu.number().withMetadata({ label: "Budget ($)" }),
      })
      .withMetadata({
        // Sync validation for immediate feedback
        validateOnSubmit: (data: any) => {
          if (data.memberCount && data.budget) {
            const budgetPerMember = data.budget / data.memberCount;
            if (budgetPerMember < 1000) {
              return "Budget per team member must be at least $1,000";
            }
          }
          return undefined;
        },
        // Async validation for server-side checks
        validateOnSubmitAsync: async (data: any) => {
          await delay(1000);

          // Simulate checking team name availability
          const takenTeamNames = ["alpha team", "beta squad", "gamma force"];
          if (
            data.teamName &&
            takenTeamNames.includes(data.teamName.toLowerCase())
          ) {
            return "This team name is already taken. Please choose another one.";
          }

          // Simulate budget approval check
          if (data.budget && data.budget > 100000) {
            return "Budgets over $100,000 require manager approval. Please contact your manager.";
          }

          return undefined;
        },
      });

    const form = useSchemaForm({
      schema,
      onSubmit: async (data) => {
        console.log("Form submitted:", data);
        showToast("Form submitted successfully!", "default");
      },
    });

    return (
      <SchemaForm form={form} className="space-y-4">
        <SchemaFormBody form={form} />
        <SchemaFormValidationErrors form={form} />
        <SchemaFormButtonBar form={form} />
      </SchemaForm>
    );
  },
};
