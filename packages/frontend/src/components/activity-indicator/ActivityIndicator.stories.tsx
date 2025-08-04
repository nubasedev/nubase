import type { Meta, StoryObj } from "@storybook/react";
import { ActivityIndicator } from "./ActivityIndicator";

const meta: Meta<typeof ActivityIndicator> = {
  title: "UI/ActivityIndicator",
  component: ActivityIndicator,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A centralized activity indicator component using Tabler's IconLoader2 with consistent sizing and color variants. Provides spinning animation to indicate loading states.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl"],
      description: "Size of the activity indicator",
    },
    color: {
      control: "select",
      options: ["primary", "secondary", "surface", "surfaceVariant", "inherit"],
      description: "Color variant for the indicator",
    },
    "aria-label": {
      control: "text",
      description: "Accessibility label for screen readers",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <ActivityIndicator size="xs" />
        <span className="text-xs text-onSurfaceVariant">xs (12px)</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <ActivityIndicator size="sm" />
        <span className="text-xs text-onSurfaceVariant">sm (16px)</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <ActivityIndicator size="md" />
        <span className="text-xs text-onSurfaceVariant">md (20px)</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <ActivityIndicator size="lg" />
        <span className="text-xs text-onSurfaceVariant">lg (24px)</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <ActivityIndicator size="xl" />
        <span className="text-xs text-onSurfaceVariant">xl (32px)</span>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Available size variants from extra small to extra large.",
      },
    },
  },
};

export const Colors: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <ActivityIndicator color="primary" />
        <span className="text-xs text-onSurfaceVariant">primary</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <ActivityIndicator color="secondary" />
        <span className="text-xs text-onSurfaceVariant">secondary</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <ActivityIndicator color="surface" />
        <span className="text-xs text-onSurfaceVariant">surface</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <ActivityIndicator color="surfaceVariant" />
        <span className="text-xs text-onSurfaceVariant">surfaceVariant</span>
      </div>
      <div className="flex flex-col items-center gap-2 p-3 bg-primary rounded">
        <ActivityIndicator color="inherit" className="text-onPrimary" />
        <span className="text-xs text-onPrimary">inherit (white)</span>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Color variants following Material Design 3 color system. The 'inherit' variant adapts to parent text color.",
      },
    },
  },
};

export const InContext: Story = {
  render: () => (
    <div className="space-y-6">
      {/* Button Loading State */}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-onSurface">
          Button Loading State
        </h3>
        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-onPrimary rounded-lg disabled:opacity-50"
          disabled
        >
          <ActivityIndicator size="sm" color="inherit" />
          Saving...
        </button>
      </div>

      {/* Form Field Loading */}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-onSurface">
          Form Field Loading
        </h3>
        <div className="relative">
          <input
            type="text"
            className="w-full px-3 py-2 border border-outline rounded-lg bg-surface text-onSurface"
            value="Updating..."
            readOnly
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <ActivityIndicator size="sm" color="primary" />
          </div>
        </div>
      </div>

      {/* Card Loading */}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-onSurface">
          Card Loading State
        </h3>
        <div className="p-4 border border-outline rounded-lg bg-surface">
          <div className="flex items-center justify-center h-20">
            <div className="flex flex-col items-center gap-2">
              <ActivityIndicator size="lg" color="primary" />
              <span className="text-sm text-onSurfaceVariant">
                Loading content...
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Inline Loading */}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-onSurface">Inline Loading</h3>
        <p className="text-onSurface flex items-center gap-2">
          Processing your request
          <ActivityIndicator size="xs" color="primary" />
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Examples of ActivityIndicator used in different contexts: buttons, form fields, cards, and inline text.",
      },
    },
  },
};

export const CustomStyling: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <ActivityIndicator className="text-red-500 w-10 h-10" />
        <span className="text-xs text-onSurfaceVariant">Custom red color</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <ActivityIndicator className="text-green-500 animate-pulse" />
        <span className="text-xs text-onSurfaceVariant">Pulse animation</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <ActivityIndicator className="text-blue-500 opacity-50" />
        <span className="text-xs text-onSurfaceVariant">50% opacity</span>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Examples of custom styling using className prop to override colors, sizes, and animations.",
      },
    },
  },
};

export const AccessibilityExample: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ActivityIndicator size="sm" aria-label="Saving your changes" />
        <span className="text-onSurface">Custom aria-label for context</span>
      </div>
      <div className="flex items-center gap-2">
        <ActivityIndicator size="sm" aria-label="Loading user profile data" />
        <span className="text-onSurface">Specific loading description</span>
      </div>
      <div className="flex items-center gap-2">
        <ActivityIndicator size="sm" />
        <span className="text-onSurface">Default "Loading..." aria-label</span>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Examples showing proper accessibility labeling with custom aria-label values for different contexts.",
      },
    },
  },
};
