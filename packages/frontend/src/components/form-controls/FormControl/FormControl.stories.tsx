import type { Meta, StoryObj } from "@storybook/react";
import { TextInput } from "../controls/TextInput/TextInput";
import { FormControl } from "./FormControl";

const meta: Meta<typeof FormControl> = {
  title: "Form Controls/FormControl",
  component: FormControl,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    required: {
      control: "boolean",
    },
    layout: {
      control: "select",
      options: ["vertical", "horizontal"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Email",
    children: (
      <TextInput id="email" type="email" placeholder="Enter your email" />
    ),
  },
};

export const Required: Story = {
  args: {
    label: "Password",
    required: true,
    children: (
      <TextInput
        id="password"
        type="password"
        placeholder="Enter your password"
      />
    ),
  },
};

export const WithHint: Story = {
  args: {
    label: "Username",
    hint: "Must be at least 3 characters long",
    children: <TextInput id="username" placeholder="Enter your username" />,
  },
};

export const WithError: Story = {
  args: {
    label: "Email",
    error: "Please enter a valid email address",
    children: (
      <TextInput id="email-error" type="email" placeholder="Enter your email" />
    ),
  },
};

export const RequiredWithError: Story = {
  args: {
    label: "Password",
    required: true,
    error: "Password is required",
    children: (
      <TextInput
        id="password-error"
        type="password"
        placeholder="Enter your password"
      />
    ),
  },
};

export const WithLongHint: Story = {
  args: {
    label: "Description",
    hint: "This field has a longer hint to demonstrate text wrapping and spacing",
    children: <TextInput id="description" placeholder="Enter description" />,
  },
};

export const Validating: Story = {
  args: {
    label: "Username",
    children: (
      <TextInput id="username-validating" placeholder="Enter your username" />
    ),
    field: {
      state: {
        meta: {
          isValidating: true,
          isTouched: false,
          isValid: true,
          errors: [],
        },
      },
    } as any,
  },
};

export const HorizontalLayout: Story = {
  args: {
    label: "Email Address",
    layout: "horizontal",
    children: (
      <TextInput
        id="email-horizontal"
        type="email"
        placeholder="Enter your email"
      />
    ),
  },
};

export const HorizontalWithError: Story = {
  args: {
    label: "Password",
    layout: "horizontal",
    required: true,
    error: "Password must be at least 8 characters",
    children: (
      <TextInput
        id="password-horizontal"
        type="password"
        placeholder="Enter your password"
      />
    ),
  },
};

export const HorizontalWithHint: Story = {
  args: {
    label: "Username",
    layout: "horizontal",
    hint: "Must be unique and contain only letters and numbers",
    children: (
      <TextInput id="username-horizontal" placeholder="Choose a username" />
    ),
  },
};

export const HorizontalFormExample: Story = {
  render: () => (
    <div className="w-full max-w-md space-y-4">
      <FormControl label="First Name" layout="horizontal" required>
        <TextInput id="firstName" placeholder="John" />
      </FormControl>
      <FormControl label="Last Name" layout="horizontal" required>
        <TextInput id="lastName" placeholder="Doe" />
      </FormControl>
      <FormControl label="Email" layout="horizontal">
        <TextInput id="email" type="email" placeholder="john@example.com" />
      </FormControl>
      <FormControl
        label="Phone"
        layout="horizontal"
        hint="Include country code"
      >
        <TextInput id="phone" type="tel" placeholder="+1 (555) 123-4567" />
      </FormControl>
    </div>
  ),
};
