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
        <p className="text-sm text-muted-foreground mb-4">
          String field in edit mode (shows error when text is longer than 10
          characters)
        </p>
        <FormFieldRenderer
          schema={schema}
          fieldState={fieldState}
          metadata={schema._meta}
          mode="edit"
        />
        <p className="text-xs text-muted-foreground mt-2">Value: {value}</p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "String field in edit mode. Interactive text input that shows error state when text exceeds 10 characters.",
      },
    },
  },
};

export const StringFieldView: Story = {
  render: () => {
    const value = "Hello, World!";

    const schema = nu.string().withMeta({
      label: "Text Field",
      description: "Enter some text",
    });

    const fieldState = createMockField({
      name: "textField",
      value,
      isValid: true,
      isTouched: false,
      errors: [],
      handleChange: () => {},
      handleBlur: () => {},
    });

    return (
      <div className="w-80">
        <p className="text-sm text-muted-foreground mb-4">
          String field in view mode (read-only)
        </p>
        <FormFieldRenderer
          schema={schema}
          fieldState={fieldState}
          metadata={schema._meta}
          mode="view"
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "String field in view mode. Displays the value as read-only text.",
      },
    },
  },
};

export const StringFieldPatch: Story = {
  render: () => {
    const [value, setValue] = useState("Click to edit this text");

    const schema = nu.string().withMeta({
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
      handleBlur: () => console.log("String field blurred"),
    });

    const handlePatch = async (newValue: any): Promise<PatchResult> => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      showToast(`Updated text to: ${newValue}`, "default");
      return { success: true };
    };

    return (
      <div className="w-80">
        <p className="text-sm text-muted-foreground mb-4">
          String field in patch mode - click to edit inline
        </p>
        <FormFieldRenderer
          schema={schema}
          fieldState={fieldState}
          metadata={schema._meta}
          mode="patch"
          onPatch={handlePatch}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "String field in patch mode. Click the value to edit inline with auto-focus and text selection.",
      },
    },
  },
};

export const NumberFieldEdit: Story = {
  render: () => {
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
        <p className="text-sm text-muted-foreground mb-4">
          Number field in edit mode (shows error when value is negative)
        </p>
        <FormFieldRenderer
          schema={schema}
          fieldState={fieldState}
          metadata={schema._meta}
          mode="edit"
        />
        <p className="text-xs text-muted-foreground mt-2">Value: {value}</p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Number field in edit mode. Interactive number input that shows error state for negative values.",
      },
    },
  },
};

export const NumberFieldView: Story = {
  render: () => {
    const value = 42;

    const schema = nu.number().withMeta({
      label: "Number Field",
      description: "Enter a number",
    });

    const fieldState = createMockField({
      name: "numberField",
      value,
      isValid: true,
      isTouched: false,
      errors: [],
      handleChange: () => {},
      handleBlur: () => {},
    });

    return (
      <div className="w-80">
        <p className="text-sm text-muted-foreground mb-4">
          Number field in view mode (read-only)
        </p>
        <FormFieldRenderer
          schema={schema}
          fieldState={fieldState}
          metadata={schema._meta}
          mode="view"
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Number field in view mode. Displays the value as read-only text.",
      },
    },
  },
};

export const NumberFieldPatch: Story = {
  render: () => {
    const [value, setValue] = useState(100);

    const schema = nu.number().withMeta({
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
      handleBlur: () => console.log("Number field blurred"),
    });

    const handlePatch = async (newValue: any): Promise<PatchResult> => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      showToast(`Updated number to: ${newValue}`, "default");
      return { success: true };
    };

    return (
      <div className="w-80">
        <p className="text-sm text-muted-foreground mb-4">
          Number field in patch mode - click to edit inline
        </p>
        <FormFieldRenderer
          schema={schema}
          fieldState={fieldState}
          metadata={schema._meta}
          mode="patch"
          onPatch={handlePatch}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Number field in patch mode. Click the value to edit inline with auto-focus and text selection.",
      },
    },
  },
};

export const BooleanFieldEdit: Story = {
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
        <p className="text-sm text-muted-foreground mb-4">
          Boolean field in edit mode (checkbox input)
        </p>
        <FormFieldRenderer
          schema={schema}
          fieldState={fieldState}
          metadata={schema._meta}
          mode="edit"
        />
        <p className="text-xs text-muted-foreground mt-2">
          Value: {String(value)}
        </p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Boolean field in edit mode. Interactive checkbox that can be toggled.",
      },
    },
  },
};

export const BooleanFieldView: Story = {
  render: () => {
    const value = true;

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
      handleChange: () => {},
      handleBlur: () => {},
    });

    return (
      <div className="w-80">
        <p className="text-sm text-muted-foreground mb-4">
          Boolean field in view mode (read-only)
        </p>
        <FormFieldRenderer
          schema={schema}
          fieldState={fieldState}
          metadata={schema._meta}
          mode="view"
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Boolean field in view mode. Displays the value as read-only text (Yes/No).",
      },
    },
  },
};

export const BooleanFieldPatch: Story = {
  render: () => {
    const [value, setValue] = useState(false);

    const schema = nu.boolean().withMeta({
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
      handleBlur: () => console.log("Boolean field blurred"),
    });

    const handlePatch = async (newValue: any): Promise<PatchResult> => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      showToast(`Updated boolean to: ${newValue}`, "default");
      return { success: true };
    };

    return (
      <div className="w-80">
        <p className="text-sm text-muted-foreground mb-4">
          Boolean field in patch mode - click to toggle inline
        </p>
        <FormFieldRenderer
          schema={schema}
          fieldState={fieldState}
          metadata={schema._meta}
          mode="patch"
          onPatch={handlePatch}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Boolean field in patch mode. Click the checkbox to toggle the value inline.",
      },
    },
  },
};

export const UnsupportedFieldEdit: Story = {
  render: () => {
    const value = "some value";

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
      handleChange: () => {},
      handleBlur: () => {},
    });

    return (
      <div className="w-80">
        <p className="text-sm text-muted-foreground mb-4">
          Unsupported field type in edit mode (non-editable error display)
        </p>
        <FormFieldRenderer
          schema={schema as any}
          fieldState={fieldState}
          metadata={(schema as any)._meta}
          mode="edit"
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Unsupported field renderer in edit mode. Displays an error container with message indicating the field type is not supported and cannot be edited.",
      },
    },
  },
};

export const UnsupportedFieldView: Story = {
  render: () => {
    const value = "Some unsupported value";

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
      handleChange: () => {},
      handleBlur: () => {},
    });

    return (
      <div className="w-80">
        <p className="text-sm text-muted-foreground mb-4">
          Unsupported field type in view mode (error display)
        </p>
        <FormFieldRenderer
          schema={schema as any}
          fieldState={fieldState}
          metadata={(schema as any)._meta}
          mode="view"
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Unsupported field renderer in view mode. Displays an error container with message indicating the field type is not supported.",
      },
    },
  },
};

export const UnsupportedFieldPatch: Story = {
  render: () => {
    const value = "some value";

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
      handleChange: () => {},
      handleBlur: () => {},
    });

    const handlePatch = async (_newValue: any): Promise<PatchResult> => {
      // This won't actually be called since unsupported fields can't be edited
      await new Promise((resolve) => setTimeout(resolve, 500));
      showToast(`This should not happen`, "error");
      return { success: true };
    };

    return (
      <div className="w-80">
        <p className="text-sm text-muted-foreground mb-4">
          Unsupported field type in patch mode (non-editable error display)
        </p>
        <FormFieldRenderer
          schema={schema as any}
          fieldState={fieldState}
          metadata={(schema as any)._meta}
          mode="patch"
          onPatch={handlePatch}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Unsupported field renderer in patch mode. Displays an error container that cannot be clicked or edited.",
      },
    },
  },
};
