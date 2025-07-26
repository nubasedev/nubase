import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { showToast } from "../../floating/toast";
import { TextInput } from "../../form-controls/controls/TextInput/TextInput";
import { type PatchResult, PatchWrapper } from "./PatchWrapper";

const meta: Meta<typeof PatchWrapper> = {
  title: "Form/PatchWrapper",
  component: PatchWrapper,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isEditing: { control: "boolean" },
    onStartEdit: { action: "start-edit" },
    onPatch: { action: "patch" },
    onCancel: { action: "cancel" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ViewMode: Story = {
  render: (args) => {
    const [isEditing, setIsEditing] = useState(args.isEditing || false);
    const [value, setValue] = useState("Editable content");

    return (
      <PatchWrapper
        {...args}
        isEditing={isEditing}
        onStartEdit={() => setIsEditing(true)}
        onPatch={async (): Promise<PatchResult> => {
          showToast("Applying changes...", "default");
          await new Promise((resolve) => setTimeout(resolve, 800));
          showToast("Changes applied successfully!", "default");
          setIsEditing(false);
          return { success: true };
        }}
        onCancel={() => setIsEditing(false)}
        editComponent={(errors) => (
          <TextInput
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter text"
            hasError={errors.length > 0}
          />
        )}
      >
        <div className="px-3 py-2 text-foreground min-h-[2.5rem] flex items-center">
          {value || (
            <span className="text-foregroundVariant italic">
              Click me to edit
            </span>
          )}
        </div>
      </PatchWrapper>
    );
  },
};

export const EditMode: Story = {
  render: () => {
    const [value, setValue] = useState("Editable content");

    return (
      <PatchWrapper
        isEditing={true}
        onStartEdit={() => {}}
        onPatch={async (): Promise<PatchResult> => {
          await new Promise((resolve) => setTimeout(resolve, 500));
          return { success: true };
        }}
        onCancel={() => {}}
        editComponent={(errors) => (
          <TextInput
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter text"
            hasError={errors.length > 0}
          />
        )}
      >
        <div className="px-3 py-2 text-foreground">Original content</div>
      </PatchWrapper>
    );
  },
};

export const InteractiveExample: Story = {
  render: () => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState("Click to edit this text");
    const [tempValue, setTempValue] = useState(value);

    const handleStartEdit = () => {
      setTempValue(value);
      setIsEditing(true);
    };

    const handlePatch = async (): Promise<PatchResult> => {
      showToast("Updating text...", "default");

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setValue(tempValue);
      setIsEditing(false);
      showToast("Text updated successfully!", "default");

      return { success: true };
    };

    const handleCancel = () => {
      setTempValue(value);
      setIsEditing(false);
    };

    return (
      <div className="w-80">
        <PatchWrapper
          isEditing={isEditing}
          onStartEdit={handleStartEdit}
          onPatch={handlePatch}
          onCancel={handleCancel}
          editComponent={(errors) => (
            <TextInput
              type="text"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              placeholder="Enter text"
              hasError={errors.length > 0}
            />
          )}
        >
          <div className="px-3 py-2 text-foreground min-h-[2.5rem] flex items-center">
            {value || (
              <span className="text-foregroundVariant italic">Empty</span>
            )}
          </div>
        </PatchWrapper>
      </div>
    );
  },
};

export const LongTextExample: Story = {
  render: () => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(
      "This is a longer text that demonstrates how the patch wrapper works with multi-line content. You can click anywhere on this text to start editing it.",
    );
    const [tempValue, setTempValue] = useState(value);

    const handleStartEdit = () => {
      setTempValue(value);
      setIsEditing(true);
    };

    const handlePatch = async (): Promise<PatchResult> => {
      showToast("Saving changes...", "default");
      await new Promise((resolve) => setTimeout(resolve, 800));
      setValue(tempValue);
      setIsEditing(false);
      showToast("Long text updated!", "default");
      return { success: true };
    };

    const handleCancel = () => {
      setTempValue(value);
      setIsEditing(false);
    };

    return (
      <div className="w-96">
        <PatchWrapper
          isEditing={isEditing}
          onStartEdit={handleStartEdit}
          onPatch={handlePatch}
          onCancel={handleCancel}
          editComponent={(errors) => (
            <textarea
              className={`w-full p-3 border rounded-lg bg-background text-foreground placeholder-muted-foreground resize-none min-h-[6rem] ${
                errors.length > 0
                  ? "border-error focus:ring-error/10"
                  : "border-border"
              }`}
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              placeholder="Enter text"
            />
          )}
        >
          <div className="px-3 py-2 text-foreground min-h-[6rem]">
            {value || (
              <span className="text-foregroundVariant italic">Empty</span>
            )}
          </div>
        </PatchWrapper>
      </div>
    );
  },
};

export const ValidationErrorsExample: Story = {
  render: () => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState("Valid text");
    const [tempValue, setTempValue] = useState(value);

    const handleStartEdit = () => {
      setTempValue(value);
      setIsEditing(true);
    };

    const handlePatch = async (): Promise<PatchResult> => {
      showToast("Validating...", "default");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulate validation logic
      const errors: string[] = [];

      if (tempValue.length < 3) {
        errors.push("Text must be at least 3 characters long");
      }

      if (tempValue.includes("error")) {
        errors.push("Text cannot contain the word 'error'");
      }

      if (tempValue.startsWith(" ") || tempValue.endsWith(" ")) {
        errors.push("Text cannot start or end with spaces");
      }

      if (errors.length > 0) {
        showToast("Validation failed", "error");
        return { success: false, errors };
      }

      setValue(tempValue);
      setIsEditing(false);
      showToast("Text validated and saved!", "default");
      return { success: true };
    };

    const handleCancel = () => {
      setTempValue(value);
      setIsEditing(false);
    };

    return (
      <div className="w-80">
        <div className="mb-4 p-3 bg-backgroundVariant rounded-lg text-sm text-foregroundVariant">
          <strong>Try these to see validation errors:</strong>
          <ul className="mt-2 space-y-1">
            <li>• Type less than 3 characters</li>
            <li>• Include the word "error"</li>
            <li>• Add spaces at start/end</li>
          </ul>
        </div>

        <PatchWrapper
          isEditing={isEditing}
          onStartEdit={handleStartEdit}
          onPatch={handlePatch}
          onCancel={handleCancel}
          editComponent={(errors) => (
            <TextInput
              type="text"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              placeholder="Enter text (try 'hi' or 'error')"
              hasError={errors.length > 0}
            />
          )}
        >
          <div className="px-3 py-2 text-foreground min-h-[2.5rem] flex items-center">
            {value || (
              <span className="text-foregroundVariant italic">Empty</span>
            )}
          </div>
        </PatchWrapper>
      </div>
    );
  },
};

export const NetworkErrorExample: Story = {
  render: () => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState("Click to simulate network error");
    const [tempValue, setTempValue] = useState(value);
    const [shouldFail, setShouldFail] = useState(false);

    const handleStartEdit = () => {
      setTempValue(value);
      setIsEditing(true);
    };

    const handlePatch = async (): Promise<PatchResult> => {
      showToast("Saving to server...", "default");
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Simulate network error on every other attempt
      if (shouldFail) {
        setShouldFail(false);
        throw new Error("Network connection failed");
      }

      setShouldFail(true);
      setValue(tempValue);
      setIsEditing(false);
      showToast("Saved successfully!", "default");
      return { success: true };
    };

    const handleCancel = () => {
      setTempValue(value);
      setIsEditing(false);
    };

    return (
      <div className="w-80">
        <div className="mb-4 p-3 bg-backgroundVariant rounded-lg text-sm text-foregroundVariant">
          <strong>Simulates network errors:</strong>
          <br />
          Every other save attempt will fail with a generic error message.
        </div>

        <PatchWrapper
          isEditing={isEditing}
          onStartEdit={handleStartEdit}
          onPatch={handlePatch}
          onCancel={handleCancel}
          editComponent={(errors) => (
            <TextInput
              type="text"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              placeholder="Enter text"
              hasError={errors.length > 0}
            />
          )}
        >
          <div className="px-3 py-2 text-foreground min-h-[2.5rem] flex items-center">
            {value || (
              <span className="text-foregroundVariant italic">Empty</span>
            )}
          </div>
        </PatchWrapper>
      </div>
    );
  },
};
