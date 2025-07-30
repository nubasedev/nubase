import { nu } from "@nubase/core";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { type FieldApi, FormFieldRenderer } from "./FormFieldRenderer";

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
};

export default meta;
type Story = StoryObj<typeof meta>;

export const StringField: Story = {
  render: () => {
    const [value, setValue] = useState("This text is too long");
    const [hasError, setHasError] = useState(true);

    const schema = nu.string().withMeta({
      label: "Text Field",
      description: "Enter some text",
    });

    const fieldState = {
      name: "textField",
      state: {
        value,
        meta: {
          isValidating: false,
          isTouched: true,
          isValid: !hasError,
          errors: hasError ? ["Text is too long (max 10 characters)"] : [],
        },
      },
      handleChange: (newValue: string) => {
        setValue(newValue);
        setHasError(newValue.length > 10);
      },
      handleBlur: () => console.log("String field blurred"),
    } satisfies FieldApi;

    return (
      <div className="w-80">
        <p className="text-sm text-onSurfaceVariant mb-4">
          String field (shows error when text is longer than 10 characters)
        </p>
        <FormFieldRenderer
          schema={schema}
          fieldState={fieldState}
          metadata={schema._meta}
        />
        <p className="text-xs text-onSurfaceVariant mt-2">Value: {value}</p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Interactive string field that renders a text input. Shows error state when text exceeds 10 characters.",
      },
    },
  },
};

export const NumberField: Story = {
  render: () => {
    const [value, setValue] = useState(-5);
    const [hasError, setHasError] = useState(true);

    const schema = nu.number().withMeta({
      label: "Number Field",
      description: "Enter a number",
    });

    const fieldState = {
      name: "numberField",
      state: {
        value,
        meta: {
          isValidating: false,
          isTouched: true,
          isValid: !hasError,
          errors: hasError ? ["Value must be positive"] : [],
        },
      },
      handleChange: (newValue: number) => {
        setValue(newValue);
        setHasError(newValue < 0);
      },
      handleBlur: () => console.log("Number field blurred"),
    } satisfies FieldApi;

    return (
      <div className="w-80">
        <p className="text-sm text-onSurfaceVariant mb-4">
          Number field (shows error when value is negative)
        </p>
        <FormFieldRenderer
          schema={schema}
          fieldState={fieldState}
          metadata={schema._meta}
        />
        <p className="text-xs text-onSurfaceVariant mt-2">Value: {value}</p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Interactive number field that renders a number input. Shows error state for negative values.",
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

    const fieldState = {
      name: "booleanField",
      state: {
        value,
        meta: {
          isValidating: false,
          isTouched: false,
          isValid: true,
          errors: [],
        },
      },
      handleChange: (newValue: boolean) => setValue(newValue),
      handleBlur: () => console.log("Boolean field blurred"),
    } satisfies FieldApi;

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

    const fieldState = {
      name: "unsupportedField",
      state: {
        value,
        meta: {
          isValidating: false,
          isTouched: false,
          isValid: true,
          errors: [],
        },
      },
      handleChange: (newValue: string) => setValue(newValue),
      handleBlur: () => console.log("Unsupported field blurred"),
    } satisfies FieldApi;

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
