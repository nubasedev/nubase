import { nu } from "@nubase/core";
import type { Meta, StoryObj } from "@storybook/react";
import { useSchemaForm } from "../../../hooks";
import { showToast } from "../../floating/toast";
import { SchemaForm, SchemaFormBody, SchemaFormButtonBar } from "./SchemaForm";

const meta: Meta = {
  title: "Form/SchemaFormComposable - Validation",
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-3xl p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj;

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
      onSubmit: async (data) => {
        console.log("Form submitted:", data);
        showToast("Form submitted successfully!", "success");
      },
    });

    return (
      <SchemaForm form={form} className="space-y-4">
        <SchemaFormBody form={form} />
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
      onSubmit: async (data) => {
        console.log("Form submitted:", data);
        showToast("Form submitted successfully!", "success");
      },
    });

    return (
      <SchemaForm form={form} className="space-y-4">
        <SchemaFormBody form={form} />
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
        showToast("Form submitted successfully!", "success");
      },
    });

    return (
      <SchemaForm form={form} className="space-y-4">
        <SchemaFormBody form={form} />
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
        age: nu.number().withMetadata({ label: "Age" }),
      })
      .withMetadata({
        validateOnSubmit: (data: any) => {
          // Cross-field validation
          if (
            data.firstName &&
            data.lastName &&
            data.firstName === data.lastName
          ) {
            return "First name and last name cannot be the same";
          }
          if (data.age && data.age < 18) {
            return "You must be at least 18 years old to register";
          }
          return undefined;
        },
      });

    const form = useSchemaForm({
      schema,
      onSubmit: async (data) => {
        console.log("Form submitted:", data);
        showToast("Form submitted successfully!", "success");
      },
    });

    return (
      <SchemaForm form={form} className="space-y-4">
        <SchemaFormBody form={form} />
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
        showToast("Form submitted successfully!", "success");
      },
    });

    return (
      <SchemaForm form={form} className="space-y-4">
        <SchemaFormBody form={form} />
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
        showToast("Form submitted successfully!", "success");
      },
    });

    return (
      <SchemaForm form={form} className="space-y-4">
        <SchemaFormBody form={form} />
        <SchemaFormButtonBar form={form} />
      </SchemaForm>
    );
  },
};
