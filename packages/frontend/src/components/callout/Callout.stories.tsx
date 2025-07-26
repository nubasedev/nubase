import type { Meta, StoryObj } from "@storybook/react";
import { Callout } from "./Callout";

const meta: Meta<typeof Callout> = {
  title: "Feedback/Callout",
  component: Callout,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    variant: {
      control: "radio",
      options: ["info", "danger"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Callout>;

export const Info: Story = {
  args: {
    variant: "info",
    children:
      "This is an informational message that provides helpful context to the user.",
  },
};

export const Danger: Story = {
  args: {
    variant: "danger",
    children:
      "This is an error message indicating something went wrong and needs attention.",
  },
};

export const InfoWithCustomIcon: Story = {
  name: "Info with Custom Icon",
  args: {
    variant: "info",
    children: "This callout uses a custom icon instead of the default one.",
    icon: (
      <svg
        className="h-5 w-5 flex-shrink-0 mt-0.5"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L7.53 10.23a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
};

export const DangerWithCustomIcon: Story = {
  name: "Danger with Custom Icon",
  args: {
    variant: "danger",
    children: "This error callout uses a custom warning icon.",
    icon: (
      <svg
        className="h-5 w-5 flex-shrink-0 mt-0.5"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
};

export const LongContent: Story = {
  name: "Long Content",
  args: {
    variant: "info",
    children: (
      <div>
        <p className="font-medium mb-2">Important Information</p>
        <p className="mb-2">
          This is a longer callout message that spans multiple lines and
          demonstrates how the component handles more complex content. The icon
          should remain aligned at the top.
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>First important point to remember</li>
          <li>Second critical detail</li>
          <li>Third essential consideration</li>
        </ul>
      </div>
    ),
  },
};

export const FormValidationError: Story = {
  name: "Form Validation Error",
  args: {
    variant: "danger",
    children: (
      <div>
        <p className="font-medium mb-1">Form validation failed</p>
        <p>Please correct the following issues and try again.</p>
      </div>
    ),
  },
};

export const SuccessMessage: Story = {
  name: "Success Message",
  args: {
    variant: "info",
    children: (
      <div>
        <p className="font-medium mb-1">Success!</p>
        <p>Your changes have been saved successfully.</p>
      </div>
    ),
    icon: (
      <svg
        className="h-5 w-5 flex-shrink-0 mt-0.5 text-green-600"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L7.53 10.23a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
};
