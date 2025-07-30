import type { BaseSchema, SchemaMetadata } from "@nubase/core";
import type React from "react";
import { Checkbox } from "../../form-controls/controls/Checkbox/Checkbox";
import { TextInput } from "../../form-controls/controls/TextInput/TextInput";
import type { FieldApi } from "./FormFieldRenderer";

type FieldRendererProps = {
  schema: BaseSchema<any>;
  fieldState: FieldApi;
  hasError: boolean;
  metadata: SchemaMetadata<any>;
};

type FieldRenderer = (
  props: FieldRendererProps,
) => React.ReactElement<{ id?: string; hasError?: boolean }>;

export const editFieldRenderers: Record<string, FieldRenderer> = {
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
      <Checkbox
        id={fieldState.name}
        name={fieldState.name}
        onBlur={fieldState.handleBlur}
        checked={fieldState.state.value || false}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          fieldState.handleChange(e.target.checked)
        }
        hasError={hasError}
      />
    );
  },
};

export const defaultRenderer: FieldRenderer = ({ fieldState, hasError }) => {
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
