import { nu } from "@nubase/core";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { useComputedMetadata } from "./hooks/useComputedMetadata";

// Test component to debug computed metadata
const ComputedMetadataDebugger = () => {
  const [firstName, setFirstName] = useState("John");

  const schema = nu
    .object({
      firstName: nu.string().meta({
        label: "First Name",
        defaultValue: "John",
      }),
      lastName: nu.string().meta({
        label: "Last Name",
        defaultValue: "Doe",
      }),
    })
    .withComputed({
      lastName: {
        label: async (obj) => `Computed Last Name: ${obj.firstName}`,
      },
    });

  const formData = { firstName, lastName: "Doe" };
  const { metadata, isComputing, error } = useComputedMetadata(
    schema,
    formData,
  );

  return (
    <div className="p-4 space-y-4 max-w-md">
      <h2 className="text-xl font-bold">Computed Metadata Test</h2>

      <div>
        <label className="block text-sm font-medium mb-1">First Name:</label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      <div className="bg-blue-50 p-3 rounded">
        <div className="text-sm">
          <strong>First Name Label:</strong> {metadata.firstName?.label}
        </div>
        <div className="text-sm">
          <strong>Last Name Label (computed):</strong>{" "}
          {metadata.lastName?.label}
        </div>
        <div className="text-sm">
          <strong>Computing:</strong> {isComputing ? "Yes" : "No"}
        </div>
      </div>

      <div className="text-xs text-gray-600">
        <strong>Expected:</strong> Last Name Label should change from "Computed
        Last Name: John" to "Computed Last Name: [whatever you type]"
      </div>

      {error && (
        <div className="bg-red-100 p-3 rounded">
          <div className="text-red-700 text-sm">{error.message}</div>
        </div>
      )}
    </div>
  );
};

const meta = {
  title: "Debug/ComputedMetadata",
  component: ComputedMetadataDebugger,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof ComputedMetadataDebugger>;

export default meta;

type Story = StoryObj<typeof ComputedMetadataDebugger>;

export const Default: Story = {};
