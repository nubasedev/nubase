import { nu } from "@nubase/core";
import type { Meta, StoryObj } from "@storybook/react";
import type { AnyFieldApi } from "@tanstack/react-form";
import { useState } from "react";
import { showToast } from "../../floating/toast";
import { FormFieldRenderer } from "./FormFieldRenderer";

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
    layout: "centered",
    docs: {
      description: {
        component:
          "Renders form fields based on schema type. Supports string, number, boolean, and default (fallback) field types.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    layout: {
      control: "select",
      options: ["vertical", "horizontal"],
      description: "Layout style for the form control",
    },
    mode: {
      control: "select",
      options: ["edit", "view", "patch"],
      description: "Rendering mode for the field",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const StringField: Story = {
  render: (args) => {
    const [value, setValue] = useState("This text is too long");
    const [hasError, setHasError] = useState(true);

    const schema = nu.string().withMeta({
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
      handleBlur: () => console.log("String field blurred"),
    });

    return (
      <div className="w-80">
        <p className="text-sm text-onSurfaceVariant mb-4">
          String field (shows error when text is longer than 10 characters)
        </p>
        <FormFieldRenderer
          schema={schema}
          fieldState={fieldState}
          metadata={schema._meta}
          layout={args.layout}
          mode={args.mode}
        />
        <p className="text-xs text-onSurfaceVariant mt-2">Value: {value}</p>
      </div>
    );
  },
  args: {
    layout: "vertical",
    mode: "edit",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Interactive string field that renders a text input. Shows error state when text exceeds 10 characters. Use the controls to change layout and mode.",
      },
    },
  },
};

export const NumberField: Story = {
  render: (args) => {
    const [value, setValue] = useState(-5);
    const [hasError, setHasError] = useState(true);

    const schema = nu.number().withMeta({
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
      handleBlur: () => console.log("Number field blurred"),
    });

    return (
      <div className="w-80">
        <p className="text-sm text-onSurfaceVariant mb-4">
          Number field (shows error when value is negative)
        </p>
        <FormFieldRenderer
          schema={schema}
          fieldState={fieldState}
          metadata={schema._meta}
          layout={args.layout}
          mode={args.mode}
        />
        <p className="text-xs text-onSurfaceVariant mt-2">Value: {value}</p>
      </div>
    );
  },
  args: {
    layout: "vertical",
    mode: "edit",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Interactive number field that renders a number input. Shows error state for negative values. Use the controls to change layout and mode.",
      },
    },
  },
};

export const BooleanField: Story = {
  render: () => {
    const [value, setValue] = useState(true);

    const schema = nu.boolean().withMeta({
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
      handleBlur: () => console.log("Boolean field blurred"),
    });

    return (
      <div className="w-80">
        <p className="text-sm text-onSurfaceVariant mb-4">
          Boolean field (checkbox input)
        </p>
        <FormFieldRenderer
          schema={schema}
          fieldState={fieldState}
          metadata={schema._meta}
        />
        <p className="text-xs text-onSurfaceVariant mt-2">
          Value: {String(value)}
        </p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Interactive boolean field that renders a checkbox input.",
      },
    },
  },
};

export const DefaultField: Story = {
  render: () => {
    const [value, setValue] = useState("fallback value");

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
      value,
      isValid: true,
      isTouched: false,
      errors: [],
      handleChange: (newValue: string) => setValue(newValue),
      handleBlur: () => console.log("Unsupported field blurred"),
    });

    return (
      <div className="w-80">
        <p className="text-sm text-onSurfaceVariant mb-4">
          Unsupported field type (falls back to text input)
        </p>
        <FormFieldRenderer
          schema={schema as any}
          fieldState={fieldState}
          metadata={(schema as any)._meta}
        />
        <p className="text-xs text-onSurfaceVariant mt-2">Value: {value}</p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Default field renderer for unsupported schema types. Falls back to a text input with placeholder indicating unsupported type.",
      },
    },
  },
};

export const PatchModeWithFocus: Story = {
  render: () => {
    const [value, setValue] = useState(
      "Click me to edit with focus and select!",
    );

    const schema = nu.string().withMeta({
      label: "Patch Mode Text Field",
      description: "Click the text to edit it",
    });

    const fieldState = createMockField({
      name: "patchField",
      value,
      isValid: true,
      isTouched: false,
      errors: [],
      handleChange: (newValue: string) => setValue(newValue),
      handleBlur: () => console.log("Patch field blurred"),
    });

    const handlePatch = async (fieldName: string, newValue: any) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      showToast(`Updated ${fieldName} to: ${newValue}`, "success");
    };

    return (
      <div className="w-80">
        <p className="text-sm text-onSurfaceVariant mb-4">
          Patch mode field - click the text to edit. Notice how the text input
          gets focus and all text is selected when you enter edit mode.
        </p>
        <FormFieldRenderer
          schema={schema}
          fieldState={fieldState}
          metadata={schema._meta}
          mode="patch"
          onPatch={handlePatch}
        />
        <p className="text-xs text-onSurfaceVariant mt-2">Value: {value}</p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Patch mode field that demonstrates the new edit field lifecycle. When you click to edit, the text input will automatically receive focus and all text will be selected for easy editing.",
      },
    },
  },
};
