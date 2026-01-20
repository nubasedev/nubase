import { nu } from "@nubase/core";
import type { Meta, StoryObj } from "@storybook/react";
import type { AnyFieldApi } from "@tanstack/react-form";
import { useState } from "react";
import { showToast } from "../../floating/toast";
import { FormFieldRenderer } from "./FormFieldRenderer";
import type { PatchResult } from "./PatchWrapper";

// Mock factory to create field objects that satisfy AnyFieldApi interface
// Uses 'unknown' conversion to bypass strict type checking for stories
function createMockField<T>(options: {
  name: string;
  value: T;
  isValid: boolean;
  isTouched: boolean;
  errors: string[];
  handleChange: (value: T) => void;
  handleBlur: () => void;
}): AnyFieldApi {
  return {
    name: options.name,
    state: {
      value: options.value,
      meta: {
        isValidating: false,
        isTouched: options.isTouched,
        isValid: options.isValid,
        errors: options.errors,
        // Only include the minimal metadata that FormFieldRenderer actually uses
      } as any,
    },
    handleChange: options.handleChange,
    handleBlur: options.handleBlur,
  } as unknown as AnyFieldApi;
}

const meta: Meta<typeof FormFieldRenderer> = {
  title: "Form/FormFieldRenderer",
  component: FormFieldRenderer,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Renders form fields based on schema type. Supports string, number, boolean, and default (fallback) field types.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="px-3 py-2 w-lg">
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
  argTypes: {
    mode: {
      control: "select",
      options: ["edit", "view", "patch"],
      description: "Rendering mode for the field",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const StringFieldEdit: Story = {
  render: () => {
    const [value, setValue] = useState("This text is too long");
    const [hasError, setHasError] = useState(true);

    const schema = nu.string().withComputedMeta({
      label: "Text Field",
      description: "Enter some text",
    });

    const fieldState = createMockField({
      name: "textField",
      value,
      isValid: !hasError,
      isTouched: true,
      errors: hasError ? ["Text is too long (max 10 characters)"] : [],
      handleChange: (newValue: string) => {
        setValue(newValue);
        setHasError(newValue.length > 10);
      },
      handleBlur: () => {},
    });

    return (
      <FormFieldRenderer
        schema={schema}
        fieldState={fieldState}
        metadata={schema._meta}
        mode="edit"
      />
    );
  },
};

export const StringFieldView: Story = {
  render: () => {
    const schema = nu.string().withComputedMeta({
      label: "Text Field",
      description: "Enter some text",
    });

    const fieldState = createMockField({
      name: "textField",
      value: "Hello, World!",
      isValid: true,
      isTouched: false,
      errors: [],
      handleChange: () => {},
      handleBlur: () => {},
    });

    return (
      <FormFieldRenderer
        schema={schema}
        fieldState={fieldState}
        metadata={schema._meta}
        mode="view"
      />
    );
  },
};

export const StringFieldPatch: Story = {
  render: () => {
    const [value, setValue] = useState("Click to edit this text");

    const schema = nu.string().withComputedMeta({
      label: "Text Field",
      description: "Click to edit",
    });

    const fieldState = createMockField({
      name: "textField",
      value,
      isValid: true,
      isTouched: false,
      errors: [],
      handleChange: (newValue: string) => setValue(newValue),
      handleBlur: () => {},
    });

    const handlePatch = async (newValue: any): Promise<PatchResult> => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      showToast(`Updated text to: ${newValue}`, "default");
      return { success: true };
    };

    return (
      <FormFieldRenderer
        schema={schema}
        fieldState={fieldState}
        metadata={schema._meta}
        mode="patch"
        onPatch={handlePatch}
      />
    );
  },
};

export const MultilineFieldEdit: Story = {
  render: () => {
    const [value, setValue] = useState(
      "This is a longer text that spans multiple lines.\n\nIt demonstrates the multiline renderer which uses a textarea instead of a regular text input.",
    );

    const schema = nu.string().withComputedMeta({
      label: "Description",
      description: "Enter a detailed description",
      renderer: "multiline",
    });

    const fieldState = createMockField({
      name: "descriptionField",
      value,
      isValid: true,
      isTouched: false,
      errors: [],
      handleChange: (newValue: string) => setValue(newValue),
      handleBlur: () => {},
    });

    return (
      <FormFieldRenderer
        schema={schema}
        fieldState={fieldState}
        metadata={schema._meta}
        mode="edit"
      />
    );
  },
};

export const MultilineFieldView: Story = {
  render: () => {
    const schema = nu.string().withComputedMeta({
      label: "Description",
      description: "Enter a detailed description",
      renderer: "multiline",
    });

    const fieldState = createMockField({
      name: "descriptionField",
      value:
        "This is a longer text that spans multiple lines.\n\nIt demonstrates the multiline renderer in view mode.",
      isValid: true,
      isTouched: false,
      errors: [],
      handleChange: () => {},
      handleBlur: () => {},
    });

    return (
      <FormFieldRenderer
        schema={schema}
        fieldState={fieldState}
        metadata={schema._meta}
        mode="view"
      />
    );
  },
};

export const MultilineFieldPatch: Story = {
  render: () => {
    const [value, setValue] = useState(
      "Click to edit this multiline text.\n\nYou can add multiple paragraphs here.",
    );

    const schema = nu.string().withComputedMeta({
      label: "Description",
      description: "Click to edit",
      renderer: "multiline",
    });

    const fieldState = createMockField({
      name: "descriptionField",
      value,
      isValid: true,
      isTouched: false,
      errors: [],
      handleChange: (newValue: string) => setValue(newValue),
      handleBlur: () => {},
    });

    const handlePatch = async (_newValue: any): Promise<PatchResult> => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      showToast(`Updated description`, "default");
      return { success: true };
    };

    return (
      <FormFieldRenderer
        schema={schema}
        fieldState={fieldState}
        metadata={schema._meta}
        mode="patch"
        onPatch={handlePatch}
      />
    );
  },
};

export const NumberFieldEdit: Story = {
  render: () => {
    const [value, setValue] = useState(-5);
    const [hasError, setHasError] = useState(true);

    const schema = nu.number().withComputedMeta({
      label: "Number Field",
      description: "Enter a number",
    });

    const fieldState = createMockField({
      name: "numberField",
      value,
      isValid: !hasError,
      isTouched: true,
      errors: hasError ? ["Value must be positive"] : [],
      handleChange: (newValue: number) => {
        setValue(newValue);
        setHasError(newValue < 0);
      },
      handleBlur: () => {},
    });

    return (
      <FormFieldRenderer
        schema={schema}
        fieldState={fieldState}
        metadata={schema._meta}
        mode="edit"
      />
    );
  },
};

export const NumberFieldView: Story = {
  render: () => {
    const schema = nu.number().withComputedMeta({
      label: "Number Field",
      description: "Enter a number",
    });

    const fieldState = createMockField({
      name: "numberField",
      value: 42,
      isValid: true,
      isTouched: false,
      errors: [],
      handleChange: () => {},
      handleBlur: () => {},
    });

    return (
      <FormFieldRenderer
        schema={schema}
        fieldState={fieldState}
        metadata={schema._meta}
        mode="view"
      />
    );
  },
};

export const NumberFieldPatch: Story = {
  render: () => {
    const [value, setValue] = useState(100);

    const schema = nu.number().withComputedMeta({
      label: "Number Field",
      description: "Click to edit",
    });

    const fieldState = createMockField({
      name: "numberField",
      value,
      isValid: true,
      isTouched: false,
      errors: [],
      handleChange: (newValue: number) => setValue(newValue),
      handleBlur: () => {},
    });

    const handlePatch = async (newValue: any): Promise<PatchResult> => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      showToast(`Updated number to: ${newValue}`, "default");
      return { success: true };
    };

    return (
      <FormFieldRenderer
        schema={schema}
        fieldState={fieldState}
        metadata={schema._meta}
        mode="patch"
        onPatch={handlePatch}
      />
    );
  },
};

export const BooleanFieldEdit: Story = {
  render: () => {
    const [value, setValue] = useState(true);

    const schema = nu.boolean().withComputedMeta({
      label: "Checkbox Field",
      description: "Toggle this option",
    });

    const fieldState = createMockField({
      name: "booleanField",
      value,
      isValid: true,
      isTouched: false,
      errors: [],
      handleChange: (newValue: boolean) => setValue(newValue),
      handleBlur: () => {},
    });

    return (
      <FormFieldRenderer
        schema={schema}
        fieldState={fieldState}
        metadata={schema._meta}
        mode="edit"
      />
    );
  },
};

export const BooleanFieldView: Story = {
  render: () => {
    const schema = nu.boolean().withComputedMeta({
      label: "Checkbox Field",
      description: "Toggle this option",
    });

    const fieldState = createMockField({
      name: "booleanField",
      value: true,
      isValid: true,
      isTouched: false,
      errors: [],
      handleChange: () => {},
      handleBlur: () => {},
    });

    return (
      <FormFieldRenderer
        schema={schema}
        fieldState={fieldState}
        metadata={schema._meta}
        mode="view"
      />
    );
  },
};

export const BooleanFieldPatch: Story = {
  render: () => {
    const [value, setValue] = useState(false);

    const schema = nu.boolean().withComputedMeta({
      label: "Checkbox Field",
      description: "Click to toggle",
    });

    const fieldState = createMockField({
      name: "booleanField",
      value,
      isValid: true,
      isTouched: false,
      errors: [],
      handleChange: (newValue: boolean) => setValue(newValue),
      handleBlur: () => {},
    });

    const handlePatch = async (newValue: any): Promise<PatchResult> => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      showToast(`Updated boolean to: ${newValue}`, "default");
      return { success: true };
    };

    return (
      <FormFieldRenderer
        schema={schema}
        fieldState={fieldState}
        metadata={schema._meta}
        mode="patch"
        onPatch={handlePatch}
      />
    );
  },
};

export const UnsupportedFieldEdit: Story = {
  render: () => {
    const schema = {
      type: "unsupported",
      _meta: {
        label: "Unsupported Field",
        description: "This field type is not supported",
      },
      parse: (data: any) => data,
    };

    const fieldState = createMockField({
      name: "unsupportedField",
      value: "some value",
      isValid: true,
      isTouched: false,
      errors: [],
      handleChange: () => {},
      handleBlur: () => {},
    });

    return (
      <FormFieldRenderer
        schema={schema as any}
        fieldState={fieldState}
        metadata={(schema as any)._meta}
        mode="edit"
      />
    );
  },
};

export const UnsupportedFieldView: Story = {
  render: () => {
    const schema = {
      type: "unsupported",
      _meta: {
        label: "Unsupported Field",
        description: "This field type is not supported",
      },
      parse: (data: any) => data,
    };

    const fieldState = createMockField({
      name: "unsupportedField",
      value: "Some unsupported value",
      isValid: true,
      isTouched: false,
      errors: [],
      handleChange: () => {},
      handleBlur: () => {},
    });

    return (
      <FormFieldRenderer
        schema={schema as any}
        fieldState={fieldState}
        metadata={(schema as any)._meta}
        mode="view"
      />
    );
  },
};

export const UnsupportedFieldPatch: Story = {
  render: () => {
    const schema = {
      type: "unsupported",
      _meta: {
        label: "Unsupported Field",
        description: "This field type is not supported",
      },
      parse: (data: any) => data,
    };

    const fieldState = createMockField({
      name: "unsupportedField",
      value: "some value",
      isValid: true,
      isTouched: false,
      errors: [],
      handleChange: () => {},
      handleBlur: () => {},
    });

    const handlePatch = async (_newValue: any): Promise<PatchResult> => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      showToast(`This should not happen`, "error");
      return { success: true };
    };

    return (
      <FormFieldRenderer
        schema={schema as any}
        fieldState={fieldState}
        metadata={(schema as any)._meta}
        mode="patch"
        onPatch={handlePatch}
      />
    );
  },
};
