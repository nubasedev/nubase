import type { BaseSchema, SchemaMetadata } from "@nubase/core";
import { OptionalSchema } from "@nubase/core";
import type { AnyFieldApi } from "@tanstack/react-form";
import type React from "react";
import { useState } from "react";
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

  // Compute validation error for patch mode
  const isValidating = fieldState.state.meta.isValidating;
  let validationError: string | undefined;
  if (fieldState.state.meta.isTouched && !fieldState.state.meta.isValid) {
    const uniqueErrors = [...new Set(fieldState.state.meta.errors)].filter(
      (e): e is string => typeof e === "string" && e !== undefined,
    );
    validationError = uniqueErrors.join(", ");
  }

  const patchContext = {
    isPatching,
    onStartPatch: () => {
      setOriginalValue(fieldState.state.value);
      setIsPatching(true);
    },
    onApplyPatch: async (overrideValue?: unknown): Promise<PatchResult> => {
      if (onPatch) {
        // Use overrideValue if provided, otherwise read from form state
        const valueToUse =
          overrideValue !== undefined ? overrideValue : fieldState.state.value;
        const result = await onPatch(valueToUse, fieldState);
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
    onPatchSuccess: () => {
      // Exit edit mode without resetting the value (for auto-commit success)
      setIsPatching(false);
    },
    validationError,
    isValidating,
  };

  // Each mode (edit, view, patch) handles its own FormControl wrapping
  return createFieldRenderer(mode, context, patchContext);
};
