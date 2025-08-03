import type { BaseSchema, SchemaMetadata } from "@nubase/core";
import { OptionalSchema } from "@nubase/core";
import type { AnyFieldApi } from "@tanstack/react-form";
import type React from "react";
import { useState } from "react";
import { FormControl } from "../../form-controls/FormControl/FormControl";
import {
  createFieldRenderer,
  type FormFieldRendererContext,
} from "./renderer-factory";

export interface FormFieldRendererProps {
  schema: BaseSchema<any>;
  fieldState: AnyFieldApi;
  metadata: SchemaMetadata<any>;
  mode?: "edit" | "view" | "patch";
  onPatch?: (value: any) => Promise<void>;
}

export const FormFieldRenderer: React.FC<FormFieldRendererProps> = ({
  schema,
  fieldState,
  metadata,
  mode = "edit",
  onPatch,
}) => {
  const [isPatching, setIsPatching] = useState(false);
  const [originalValue, setOriginalValue] = useState(fieldState.state.value);

  const hasError =
    fieldState.state.meta.isTouched && !fieldState.state.meta.isValid;
  const isRequired = !(schema instanceof OptionalSchema);
  const schemaToRender =
    schema instanceof OptionalSchema ? schema.unwrap() : schema;

  const context: FormFieldRendererContext = {
    schema: schemaToRender,
    fieldState,
    metadata,
    hasError,
    isRequired,
  };

  const patchContext = {
    isPatching,
    onStartPatch: () => {
      setOriginalValue(fieldState.state.value);
      setIsPatching(true);
    },
    onApplyPatch: async () => {
      if (onPatch) {
        await onPatch(fieldState.state.value);
      }
      setIsPatching(false);
    },
    onCancelPatch: () => {
      fieldState.handleChange(originalValue);
      setIsPatching(false);
    },
  };

  const fieldElement = createFieldRenderer(mode, context, patchContext);

  return (
    <FormControl
      label={metadata.label}
      hint={metadata.description}
      field={fieldState}
      required={isRequired}
      layout="horizontal"
    >
      {fieldElement}
    </FormControl>
  );
};
