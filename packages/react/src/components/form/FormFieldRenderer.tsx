import type { BaseSchema } from "@nubase/core";
import type React from "react";
import { FormControl } from "../form-controls/FormControl/FormControl";
import { TextInput } from "../form-controls/TextInput/TextInput";

export interface FormFieldRendererProps {
  schema: BaseSchema<any>;
  fieldState: any;
  metadata: any;
}

type FieldRendererProps = {
  schema: BaseSchema<any>;
  fieldState: any;
  hasError: boolean;
  metadata: any;
};

type FieldRenderer = (
  props: FieldRendererProps,
) => React.ReactElement<{ id?: string; hasError?: boolean }>;

const fieldRenderers: Record<string, FieldRenderer> = {
  string: ({ fieldState, hasError, metadata }) => {
    return (
      <TextInput
        id={fieldState.name}
        name={fieldState.name}
        onBlur={fieldState.handleBlur}
        type="text"
        value={fieldState.state.value || ""}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          fieldState.handleChange(e.target.value)
        }
        placeholder={metadata.description}
        hasError={hasError}
      />
    );
  },

  number: ({ fieldState, hasError, metadata }) => {
    return (
      <TextInput
        id={fieldState.name}
        name={fieldState.name}
        onBlur={fieldState.handleBlur}
        type="number"
        value={fieldState.state.value || 0}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          fieldState.handleChange(Number(e.target.value))
        }
        placeholder={metadata.description}
        hasError={hasError}
      />
    );
  },

  boolean: ({ fieldState, hasError }) => {
    return (
      <input
        id={fieldState.name}
        name={fieldState.name}
        onBlur={fieldState.handleBlur}
        type="checkbox"
        checked={fieldState.state.value || false}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          fieldState.handleChange(e.target.checked)
        }
        className={`w-4 h-4 rounded focus:ring-2 ${
          hasError
            ? "border-error focus:ring-error/20"
            : "border-outline focus:ring-primary/20"
        }`}
      />
    );
  },
};

const defaultRenderer: FieldRenderer = ({ fieldState, hasError }) => {
  return (
    <TextInput
      id={fieldState.name}
      name={fieldState.name}
      onBlur={fieldState.handleBlur}
      type="text"
      value={String(fieldState.state.value || "")}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        fieldState.handleChange(e.target.value)
      }
      placeholder="Unsupported field type"
      hasError={hasError}
    />
  );
};

export const FormFieldRenderer: React.FC<FormFieldRendererProps> = ({
  schema,
  fieldState,
  metadata,
}) => {
  // Calculate hasError from field state
  const hasError =
    fieldState.state.meta.isTouched && !fieldState.state.meta.isValid;

  const renderer = fieldRenderers[schema.type] || defaultRenderer;
  const fieldElement = renderer({
    schema,
    fieldState,
    hasError,
    metadata,
  });

  return (
    <FormControl
      label={metadata.label}
      hint={metadata.description}
      field={fieldState}
      required={metadata.required || false}
    >
      {fieldElement}
    </FormControl>
  );
};
