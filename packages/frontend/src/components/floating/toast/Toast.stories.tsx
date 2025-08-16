import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../../buttons/Button/Button";
import { showPromiseToast, showToast } from "./index";

const meta: Meta = {
  title: "Floating/Toast",
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen p-8">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-text">Toast Examples</h1>

      <div className="grid grid-cols-2 gap-4 max-w-2xl">
        <Button onClick={() => showToast("This is a default toast message")}>
          Default Toast
        </Button>

        <Button
          onClick={() => showToast("Something went wrong", "error")}
          variant="destructive"
        >
          Error Toast
        </Button>

        <Button
          onClick={() =>
            showToast("This toast won't auto-close", "default", {
              duration: 0,
            })
          }
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
      <h1 className="text-2xl font-bold text-text">Multiple Toasts</h1>

      <div className="space-x-4">
        <Button
          onClick={() => {
            showToast("First toast");
            setTimeout(() => showToast("Second toast"), 500);
            setTimeout(() => showToast("Third toast"), 1000);
            setTimeout(() => showToast("Fourth toast", "error"), 1500);
          }}
        >
          Show Multiple Toasts
        </Button>

        <Button
          onClick={() => {
            for (let i = 1; i <= 5; i++) {
              setTimeout(() => showToast(`Toast ${i} of 5`), i * 200);
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
      <h1 className="text-2xl font-bold text-text">Promise Toasts</h1>

      <div className="space-x-4">
        <Button
          onClick={() => {
            const promise = new Promise((resolve) => {
              setTimeout(resolve, 2000);
            });

            showPromiseToast(
              promise,
              (result) => ({
                message: result.success
                  ? "Data saved successfully!"
                  : "Failed to save data",
                type: result.success ? "default" : "error",
              }),
              {
                loadingText: "Saving data...",
              },
            );
          }}
        >
          Promise Success
        </Button>

        <Button
          onClick={() => {
            const promise = new Promise((_, reject) => {
              setTimeout(reject, 2000);
            });

            showPromiseToast(
              promise,
              (result) => ({
                message: result.success
                  ? "Request processed successfully!"
                  : "Request processing failed",
                type: result.success ? "default" : "error",
              }),
              {
                loadingText: "Processing request...",
              },
            );
          }}
          variant="destructive"
        >
          Promise Error
        </Button>

        <Button
          onClick={() => {
            const promise = fetch("/api/non-existent-endpoint");

            showPromiseToast(
              promise,
              (result) => ({
                message: result.success
                  ? "Data fetched successfully!"
                  : "Failed to fetch data",
                type: result.success ? "default" : "error",
              }),
              {
                loadingText: "Fetching data...",
              },
            );
          }}
          variant="secondary"
        >
          Real Promise (will fail)
        </Button>

        <Button
          onClick={() => {
            const promise = new Promise((resolve) => {
              setTimeout(resolve, 1500);
            });

            showPromiseToast(
              promise,
              (result) => ({
                message: result.success
                  ? "Task completed successfully!"
                  : "Task failed to complete",
                type: result.success ? "default" : "error",
              }),
              {
                loadingText: "Processing task...",
              },
            );
          }}
        >
          Promise with Success Type
        </Button>

        <Button
          onClick={() => {
            const promise = new Promise((resolve) => {
              setTimeout(resolve, 1500);
            });

            showPromiseToast(
              promise,
              (result) => ({
                message: result.success
                  ? "Task finished successfully!"
                  : "Task encountered an error",
                type: result.success ? "default" : "error",
              }),
              {
                loadingText: "Working on task...",
              },
            );
          }}
          variant="secondary"
        >
          Promise with Default Type
        </Button>

        <Button
          onClick={() => {
            const promise = new Promise((resolve, _reject) => {
              // Simulate API that returns success but with an error status
              setTimeout(() => {
                resolve({ status: "error", message: "Invalid data provided" });
              }, 1500);
            });

            showPromiseToast(
              promise,
              (result) => {
                if (result.success) {
                  const data = result.data as {
                    status: string;
                    message: string;
                  };
                  return {
                    message:
                      data.status === "error"
                        ? data.message
                        : "API call successful",
                    type: data.status === "error" ? "error" : "default",
                  };
                }
                return {
                  message: "Network error occurred",
                  type: "error" as const,
                };
              },
              {
                loadingText: "Calling API...",
              },
            );
          }}
        >
          API Success but Error Response
        </Button>
      </div>
    </div>
  ),
};

export const CustomContent: Story = {
  render: () => (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-text">Custom Content</h1>

      <div className="space-x-4">
        <Button
          onClick={() =>
            showToast(
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
            showToast(
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span>Task completed with custom styling!</span>
              </div>,
              "default",
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
      <h1 className="text-2xl font-bold text-text">Duration Examples</h1>

      <div className="space-x-4">
        <Button
          onClick={() =>
            showToast("Quick toast (1s)", "default", {
              duration: 1000,
            })
          }
        >
          1 Second
        </Button>

        <Button
          onClick={() =>
            showToast("Normal toast (4s)", "default", {
              duration: 4000,
            })
          }
          variant="secondary"
        >
          4 Seconds
        </Button>

        <Button
          onClick={() =>
            showToast("Long toast (10s)", "default", {
              duration: 10000,
            })
          }
        >
          10 Seconds (Default)
        </Button>
      </div>
    </div>
  ),
};
