import type { BaseSchema, SchemaMetadata } from "@nubase/core";
import { OptionalSchema } from "@nubase/core";
import type { AnyFieldApi } from "@tanstack/react-form";
import type React from "react";
import { useState } from "react";
import { FormControl } from "../../form-controls/FormControl/FormControl";
import type { PatchResult } from "./PatchWrapper";
import {
  createFieldRenderer,
  type FormFieldRendererContext,
} from "./renderer-factory";

export interface FormFieldRendererProps {
  schema: BaseSchema<any>;
  fieldState: AnyFieldApi;
  metadata: SchemaMetadata<any>;
  mode?: "edit" | "view" | "patch";
  onPatch?: (value: any, fieldState?: AnyFieldApi) => Promise<PatchResult>;
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
    onApplyPatch: async (): Promise<PatchResult> => {
      if (onPatch) {
        const result = await onPatch(fieldState.state.value, fieldState);
        if (result.success) {
          setIsPatching(false);
        }
        return result;
      }
      setIsPatching(false);
      return { success: true };
    },
    onCancelPatch: () => {
      fieldState.handleChange(originalValue);
      setIsPatching(false);
    },
  };

  const fieldElement = createFieldRenderer(mode, context, patchContext);

  // Show hint in edit mode, or in patch mode when actively patching
  const showHint = mode === "edit" || (mode === "patch" && isPatching);

  return (
    <FormControl
      label={metadata.label}
      hint={showHint ? metadata.description : undefined}
      field={fieldState} // Always use TanStack Form validation
      required={isRequired}
      layout="horizontal"
    >
      {fieldElement}
    </FormControl>
  );
};
