import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { showToast } from "../../floating/toast";
import { TextInput } from "../../form-controls/controls/TextInput/TextInput";
import { PatchWrapper } from "./PatchWrapper";

const meta: Meta<typeof PatchWrapper> = {
  title: "Form/PatchWrapper",
  component: PatchWrapper,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isEditing: { control: "boolean" },
    onStartEdit: { action: "start-edit" },
    onApply: { action: "apply" },
    onCancel: { action: "cancel" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ViewMode: Story = {
  render: (args) => {
    const [isEditing, setIsEditing] = useState(args.isEditing || false);

    return (
      <PatchWrapper
        {...args}
        isEditing={isEditing}
        onStartEdit={() => setIsEditing(true)}
        onApply={async () => {
          showToast("Changes applied successfully!", "success");
          await new Promise((resolve) => setTimeout(resolve, 300));
          setIsEditing(false);
        }}
        onCancel={() => setIsEditing(false)}
        editComponent={
          <TextInput
            type="text"
            value="Editable content"
            onChange={() => {}}
            placeholder="Enter text"
          />
        }
      >
        <div className="px-3 py-2 text-onSurface">Click me to edit</div>
      </PatchWrapper>
    );
  },
};

export const EditMode: Story = {
  args: {
    isEditing: true,
    children: <div className="px-3 py-2 text-onSurface">Original content</div>,
    editComponent: (
      <TextInput
        type="text"
        value="Editable content"
        onChange={() => {}}
        placeholder="Enter text"
      />
    ),
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

    const handleApply = async () => {
      showToast("Updating text...", "info");
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setValue(tempValue);
      setIsEditing(false);
      showToast("Text updated successfully!", "success");
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
          onApply={handleApply}
          onCancel={handleCancel}
          editComponent={
            <TextInput
              type="text"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              placeholder="Enter text"
            />
          }
        >
          <div className="px-3 py-2 text-onSurface min-h-[2.5rem] flex items-center">
            {value || (
              <span className="text-onSurfaceVariant italic">Empty</span>
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

    const handleApply = async () => {
      showToast("Saving changes...", "info");
      await new Promise((resolve) => setTimeout(resolve, 300));
      setValue(tempValue);
      setIsEditing(false);
      showToast("Long text updated!", "success");
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
          onApply={handleApply}
          onCancel={handleCancel}
          editComponent={
            <textarea
              className="w-full p-3 border border-outline rounded-lg bg-surface text-onSurface placeholder-onSurfaceVariant resize-none min-h-[6rem]"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              placeholder="Enter text"
            />
          }
        >
          <div className="px-3 py-2 text-onSurface min-h-[6rem]">
            {value || (
              <span className="text-onSurfaceVariant italic">Empty</span>
            )}
          </div>
        </PatchWrapper>
      </div>
    );
  },
};
