import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../../buttons/Button/Button";
import { ToastContainer, ToastProvider, toast } from "./index";

const meta: Meta = {
  title: "Floating/Toast",
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <ToastProvider>
        <div className="min-h-screen bg-gray-50 p-8">
          <Story />
          <ToastContainer />
        </div>
      </ToastProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Toast Examples</h1>

      <div className="grid grid-cols-2 gap-4 max-w-2xl">
        <Button onClick={() => toast("This is a default toast message")}>
          Default Toast
        </Button>

        <Button
          onClick={() => toast.success("Operation completed successfully!")}
          variant="secondary"
        >
          Success Toast
        </Button>

        <Button
          onClick={() => toast.error("Something went wrong")}
          variant="destructive"
        >
          Error Toast
        </Button>

        <Button onClick={() => toast.warning("Please check your input")}>
          Warning Toast
        </Button>

        <Button onClick={() => toast.info("Here's some useful information")}>
          Info Toast
        </Button>

        <Button
          onClick={() => toast("This toast won't auto-close", { duration: 0 })}
        >
          Persistent Toast
        </Button>
      </div>
    </div>
  ),
};

export const MultipleToasts: Story = {
  render: () => (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Multiple Toasts</h1>

      <div className="space-x-4">
        <Button
          onClick={() => {
            toast("First toast");
            setTimeout(() => toast.success("Second toast"), 500);
            setTimeout(() => toast.warning("Third toast"), 1000);
            setTimeout(() => toast.error("Fourth toast"), 1500);
          }}
        >
          Show Multiple Toasts
        </Button>

        <Button
          onClick={() => {
            for (let i = 1; i <= 5; i++) {
              setTimeout(() => toast(`Toast ${i} of 5`), i * 200);
            }
          }}
          variant="secondary"
        >
          Rapid Fire Toasts
        </Button>
      </div>
    </div>
  ),
};

export const PromiseToasts: Story = {
  render: () => (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Promise Toasts</h1>

      <div className="space-x-4">
        <Button
          onClick={() => {
            const promise = new Promise((resolve) => {
              setTimeout(resolve, 2000);
            });

            toast.promise(promise, {
              loading: "Saving data...",
              success: "Data saved successfully!",
              error: "Failed to save data",
            });
          }}
        >
          Promise Success
        </Button>

        <Button
          onClick={() => {
            const promise = new Promise((_, reject) => {
              setTimeout(reject, 2000);
            });

            toast.promise(promise, {
              loading: "Processing request...",
              success: "Request completed!",
              error: "Request failed",
            });
          }}
          variant="destructive"
        >
          Promise Error
        </Button>

        <Button
          onClick={() => {
            const promise = fetch("/api/non-existent-endpoint");

            toast.promise(promise, {
              loading: "Fetching data...",
              success: "Data fetched successfully!",
              error: "Failed to fetch data",
            });
          }}
          variant="secondary"
        >
          Real Promise (will fail)
        </Button>
      </div>
    </div>
  ),
};

export const CustomContent: Story = {
  render: () => (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Custom Content</h1>

      <div className="space-x-4">
        <Button
          onClick={() =>
            toast(
              <div>
                <div className="font-semibold">Custom Toast</div>
                <div className="text-sm opacity-75">
                  With custom JSX content
                </div>
              </div>,
            )
          }
        >
          JSX Content
        </Button>

        <Button
          onClick={() =>
            toast.success(
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span>Task completed with custom styling!</span>
              </div>,
            )
          }
          variant="secondary"
        >
          Custom Success
        </Button>
      </div>
    </div>
  ),
};

export const LongDuration: Story = {
  render: () => (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Duration Examples</h1>

      <div className="space-x-4">
        <Button onClick={() => toast("Quick toast (1s)", { duration: 1000 })}>
          1 Second
        </Button>

        <Button
          onClick={() => toast("Normal toast (4s)", { duration: 4000 })}
          variant="secondary"
        >
          4 Seconds (Default)
        </Button>

        <Button onClick={() => toast("Long toast (10s)", { duration: 10000 })}>
          10 Seconds
        </Button>
      </div>
    </div>
  ),
};
