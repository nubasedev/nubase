import type { BaseSchema } from "@nubase/core";
import type React from "react";
import { TextInput } from "../form-controls/TextInput/TextInput";

export interface FormFieldRendererProps {
  fieldName: string;
  schema: BaseSchema<any>;
  field: any;
  metadata?: any;
  hasError?: boolean;
}

type FieldRenderer = (
  fieldName: string,
  schema: BaseSchema<any>,
  field: any,
  metadata?: any,
  hasError?: boolean,
) => React.ReactElement;

const fieldRenderers: Record<string, FieldRenderer> = {
  string: (fieldName, schema, field, metadata, hasError) => {
    const fieldMetadata = metadata || schema._meta;
    const baseProps = {
      id: field.name,
      name: field.name,
      onBlur: field.handleBlur,
    };

    return (
      <TextInput
        {...baseProps}
        type="text"
        value={field.state.value || ""}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          field.handleChange(e.target.value)
        }
        placeholder={fieldMetadata.description}
        hasError={hasError}
      />
    );
  },

  number: (fieldName, schema, field, metadata, hasError) => {
    const fieldMetadata = metadata || schema._meta;
    const baseProps = {
      id: field.name,
      name: field.name,
      onBlur: field.handleBlur,
    };

    return (
      <TextInput
        {...baseProps}
        type="number"
        value={field.state.value || 0}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          field.handleChange(Number(e.target.value))
        }
        placeholder={fieldMetadata.description}
        hasError={hasError}
      />
    );
  },

  boolean: (fieldName, schema, field, metadata, hasError) => {
    const baseProps = {
      id: field.name,
      name: field.name,
      onBlur: field.handleBlur,
    };

    return (
      <input
        {...baseProps}
        type="checkbox"
        checked={field.state.value || false}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          field.handleChange(e.target.checked)
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

const defaultRenderer: FieldRenderer = (
  fieldName,
  schema,
  field,
  metadata,
  hasError,
) => {
  const fieldMetadata = metadata || schema._meta;
  const baseProps = {
    id: field.name,
    name: field.name,
    onBlur: field.handleBlur,
  };

  return (
    <TextInput
      {...baseProps}
      type="text"
      value={String(field.state.value || "")}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        field.handleChange(e.target.value)
      }
      placeholder="Unsupported field type"
      hasError={hasError}
    />
  );
};

export const FormFieldRenderer: React.FC<FormFieldRendererProps> = ({
  fieldName,
  schema,
  field,
  metadata,
  hasError,
}) => {
  const renderer = fieldRenderers[schema.type] || defaultRenderer;
  return renderer(fieldName, schema, field, metadata, hasError);
};
