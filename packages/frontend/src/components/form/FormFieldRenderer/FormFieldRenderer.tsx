import type { BaseSchema, SchemaMetadata } from "@nubase/core";
import { OptionalSchema } from "@nubase/core";
import type React from "react";
import { useState } from "react";
import { FormControl } from "../../form-controls/FormControl/FormControl";
import { PatchWrapper } from "./PatchWrapper";
import { defaultRenderer, editFieldRenderers } from "./edit-field-renderers";
import {
  defaultViewRenderer,
  viewFieldRenderers,
} from "./view-field-renderers";

// Field interface that defines exactly what our component needs
export interface FieldApi {
  name: string;
  state: {
    value: any;
    meta: {
      isValidating: boolean;
      isTouched: boolean;
      isValid: boolean;
      errors: (string | Promise<string | undefined> | undefined)[];
    };
  };
  handleChange: (value: any) => void;
  handleBlur: () => void;
}

export interface FormFieldRendererProps {
  schema: BaseSchema<any>;
  fieldState: FieldApi;
  metadata: SchemaMetadata<any>;
  mode?: "edit" | "view" | "patch";
  onPatch?: (fieldName: string, value: any) => Promise<void>;
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

  // Calculate hasError from field state
  const hasError =
    fieldState.state.meta.isTouched && !fieldState.state.meta.isValid;

  const isRequired = !(schema instanceof OptionalSchema);

  // For optional schemas, we need to get the wrapped schema type
  const schemaToRender =
    schema instanceof OptionalSchema ? schema.unwrap() : schema;

  const handleStartPatch = () => {
    setOriginalValue(fieldState.state.value);
    setIsPatching(true);
  };

  const handleApplyPatch = async () => {
    if (onPatch) {
      await onPatch(fieldState.name, fieldState.state.value);
    }
    setIsPatching(false);
  };

  const handleCancelPatch = () => {
    fieldState.handleChange(originalValue);
    setIsPatching(false);
  };

  let fieldElement: React.ReactElement<any>;

  if (mode === "edit" || (mode === "patch" && isPatching)) {
    const editRenderer =
      editFieldRenderers[schemaToRender.type] || defaultRenderer;
    fieldElement = editRenderer({
      schema: schemaToRender,
      fieldState,
      hasError,
      metadata,
    });
  } else if (mode === "view") {
    const viewRenderer =
      viewFieldRenderers[schemaToRender.type] || defaultViewRenderer;
    fieldElement = viewRenderer({
      schema: schemaToRender,
      fieldState,
      metadata,
    });
  } else if (mode === "patch" && !isPatching) {
    // In patch mode but not currently editing, show view renderer wrapped in PatchWrapper
    const viewRenderer =
      viewFieldRenderers[schemaToRender.type] || defaultViewRenderer;
    const viewElement = viewRenderer({
      schema: schemaToRender,
      fieldState,
      metadata,
    });

    const editRenderer =
      editFieldRenderers[schemaToRender.type] || defaultRenderer;
    const editElement = editRenderer({
      schema: schemaToRender,
      fieldState,
      hasError,
      metadata,
    });

    fieldElement = (
      <PatchWrapper
        isEditing={isPatching}
        onStartEdit={handleStartPatch}
        onApply={handleApplyPatch}
        onCancel={handleCancelPatch}
        editComponent={editElement}
      >
        {viewElement}
      </PatchWrapper>
    ) as any;
  } else {
    // Fallback
    const editRenderer =
      editFieldRenderers[schemaToRender.type] || defaultRenderer;
    fieldElement = editRenderer({
      schema: schemaToRender,
      fieldState,
      hasError,
      metadata,
    });
  }

  return (
    <FormControl
      label={metadata.label}
      hint={metadata.description}
      field={fieldState}
      required={isRequired}
    >
      {fieldElement}
    </FormControl>
  );
};
