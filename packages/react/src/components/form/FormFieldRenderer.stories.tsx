import { nu } from "@nubase/core";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { FormFieldRenderer } from "./FormFieldRenderer";

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
    const [value, setValue] = useState("Hello World");
    const [hasError, setHasError] = useState(false);

    const schema = nu.string().withMeta({
      label: "Text Field",
      description: "Enter some text",
    });

    const field = {
      name: "textField",
      state: { value },
      handleChange: (newValue: string) => {
        setValue(newValue);
        setHasError(newValue.length > 10);
      },
      handleBlur: () => console.log("String field blurred"),
    };

    return (
      <div className="w-64">
        <p className="text-sm text-onSurfaceVariant mb-2">
          String field (shows error when text is longer than 10 characters)
        </p>
        <FormFieldRenderer
          fieldName="textField"
          schema={schema}
          field={field}
          hasError={hasError}
        />
        <p className="text-xs text-onSurfaceVariant mt-1">Value: {value}</p>
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
    const [value, setValue] = useState(42);
    const [hasError, setHasError] = useState(false);

    const schema = nu.number().withMeta({
      label: "Number Field",
      description: "Enter a number",
    });

    const field = {
      name: "numberField",
      state: { value },
      handleChange: (newValue: number) => {
        setValue(newValue);
        setHasError(newValue < 0);
      },
      handleBlur: () => console.log("Number field blurred"),
    };

    return (
      <div className="w-64">
        <p className="text-sm text-onSurfaceVariant mb-2">
          Number field (shows error when value is negative)
        </p>
        <FormFieldRenderer
          fieldName="numberField"
          schema={schema}
          field={field}
          hasError={hasError}
        />
        <p className="text-xs text-onSurfaceVariant mt-1">Value: {value}</p>
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

    const field = {
      name: "booleanField",
      state: { value },
      handleChange: (newValue: boolean) => setValue(newValue),
      handleBlur: () => console.log("Boolean field blurred"),
    };

    return (
      <div className="w-64">
        <p className="text-sm text-onSurfaceVariant mb-2">
          Boolean field (checkbox input)
        </p>
        <FormFieldRenderer
          fieldName="booleanField"
          schema={schema}
          field={field}
          hasError={false}
        />
        <p className="text-xs text-onSurfaceVariant mt-1">
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

    const field = {
      name: "unsupportedField",
      state: { value },
      handleChange: (newValue: string) => setValue(newValue),
      handleBlur: () => console.log("Unsupported field blurred"),
    };

    return (
      <div className="w-64">
        <p className="text-sm text-onSurfaceVariant mb-2">
          Unsupported field type (falls back to text input)
        </p>
        <FormFieldRenderer
          fieldName="unsupportedField"
          schema={schema as any}
          field={field}
          hasError={false}
        />
        <p className="text-xs text-onSurfaceVariant mt-1">Value: {value}</p>
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
