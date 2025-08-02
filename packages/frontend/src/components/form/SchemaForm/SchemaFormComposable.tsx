import {
  type BaseSchema,
  type LayoutField,
  OptionalSchema,
} from "@nubase/core";
import type React from "react";
import { forwardRef } from "react";
import type { SchemaFormConfiguration } from "../../../hooks";
import { useComputedMetadata } from "../../../hooks/useComputedMetadata";
import { useLayout } from "../../../hooks/useLayout";
import { Callout } from "../../callout/Callout";
import { FormFieldRenderer } from "../FormFieldRenderer/FormFieldRenderer";
import { SchemaFormButtonBar as ButtonBarComponent } from "./SchemaFormButtonBar";
import { SchemaFormVerticalLayout } from "./SchemaFormVerticalLayout";

export interface SchemaFormComposableProps {
  form: SchemaFormConfiguration<any>;
  className?: string;
  children?: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
}

export interface SchemaFormBodyProps {
  form: SchemaFormConfiguration<any>;
  className?: string;
  layoutName?: string;
  computedMetadata?: {
    debounceMs?: number;
  };
}

export interface SchemaFormButtonBarComposableProps {
  form: SchemaFormConfiguration<any>;
  submitText?: string;
  isComputing?: boolean;
  className?: string;
  alignment?: "left" | "center" | "right";
}

// Form component - wraps the form element
export const SchemaFormComposable = forwardRef<
  HTMLFormElement,
  SchemaFormComposableProps
>(({ form, className = "", children, onSubmit }, ref) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onSubmit) {
      onSubmit(e);
    } else {
      await form.api.handleSubmit();
    }
  };

  return (
    <form ref={ref} onSubmit={handleSubmit} className={className}>
      {children}
    </form>
  );
});

SchemaFormComposable.displayName = "SchemaFormComposable";

// Body component - renders the form fields
export const SchemaFormBody: React.FC<SchemaFormBodyProps> = ({
  form,
  className = "",
  layoutName,
  computedMetadata,
}) => {
  const { schema, mode, onPatch } = form;

  // Use computed metadata hook to get merged metadata
  const {
    metadata: mergedMetadata,
    isComputing, // Used in SchemaFormButtonBarComposable
    error: metadataError,
  } = useComputedMetadata(schema, form.formState, computedMetadata);

  // Use layout hook to get the layout (either specified or default)
  const layout = useLayout(schema, layoutName);

  return (
    <div className={`flex flex-col ${className}`}>
      {metadataError && (
        <div className="mb-4 p-3 bg-errorContainer border border-error rounded-md text-onErrorContainer text-sm">
          <strong>Metadata Error:</strong> {metadataError.message}
        </div>
      )}

      <div className="flex-1 space-y-4">
        <SchemaFormVerticalLayout
          layout={layout}
          renderField={(field: LayoutField<any>) => {
            const fieldName = field.name as string;
            const currentSchema = schema._shape[fieldName] as BaseSchema<any>;
            const fieldMetadata =
              mergedMetadata[fieldName] ?? currentSchema._meta;

            // Validation function for submit - includes required field check
            const validateFieldOnSubmit = ({ value }: { value: any }) => {
              // Check if field is required and empty
              const isFieldRequired =
                currentSchema && !(currentSchema instanceof OptionalSchema);
              if (isFieldRequired) {
                if (value === undefined || value === null || value === "") {
                  return "This field is required";
                }
              }

              // Then run schema validation
              if (fieldMetadata?.validateOnSubmit) {
                const error = fieldMetadata.validateOnSubmit(value);
                if (error) {
                  return error;
                }
              }

              return undefined;
            };

            // Async validation function for submit
            const validateFieldOnSubmitAsync = async ({
              value,
            }: {
              value: any;
            }) => {
              if (fieldMetadata?.validateOnSubmitAsync) {
                const error = await fieldMetadata.validateOnSubmitAsync(value);
                if (error) {
                  return error;
                }
              }
              return undefined;
            };

            // Build field validators object
            const fieldValidators: any = {};

            // Always include submit validators
            fieldValidators.onSubmit = validateFieldOnSubmit;

            // Add async validators if they exist
            if (fieldMetadata?.validateOnSubmitAsync) {
              fieldValidators.onSubmitAsync = validateFieldOnSubmitAsync;
            }
            if (fieldMetadata?.validateOnBlur) {
              fieldValidators.onBlur = ({ value }: { value: any }) => {
                return fieldMetadata.validateOnBlur?.(value);
              };
            }
            if (fieldMetadata?.validateOnBlurAsync) {
              fieldValidators.onBlurAsync = async ({
                value,
              }: {
                value: any;
              }) => {
                return fieldMetadata.validateOnBlurAsync?.(value);
              };
            }

            const handleFieldPatch = async (value: any) => {
              if (mode === "patch" && onPatch) {
                try {
                  await onPatch(fieldName, value);
                } catch (error) {
                  console.error(`Error patching field ${fieldName}:`, error);
                  throw error;
                }
              }
            };

            return (
              <form.api.Field
                key={fieldName}
                name={fieldName}
                validators={fieldValidators}
              >
                {(fieldState) => (
                  <FormFieldRenderer
                    schema={currentSchema}
                    fieldState={fieldState}
                    metadata={fieldMetadata}
                    mode={mode}
                    onPatch={handleFieldPatch}
                  />
                )}
              </form.api.Field>
            );
          }}
        />
      </div>

      {/* Callout to show form-level errors */}
      {form.api.state?.errors?.length > 0 && mode !== "view" && (
        <Callout variant="danger" className="mt-4">
          <ul>
            {form.api.state.errors.map((error, index) => (
              <li key={`${index}-${error}`}>{error}</li>
            ))}
          </ul>
        </Callout>
      )}
    </div>
  );
};

// ButtonBar component - wraps the existing SchemaFormButtonBar
export const SchemaFormButtonBarComposable: React.FC<
  SchemaFormButtonBarComposableProps
> = ({ form, submitText, isComputing, className, alignment }) => {
  return (
    <ButtonBarComponent
      form={form}
      submitText={submitText}
      isComputing={isComputing}
      className={className}
      alignment={alignment}
    />
  );
};
