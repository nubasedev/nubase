import { useForm } from '@tanstack/react-form';
import { useState, type FC } from 'react';
import { TextInput, Button, FormControl } from '../form-controls';
import { ObjectSchema, ObjectShape, StringSchema, NumberSchema, BooleanSchema, BaseSchema, Infer, Layout } from '@repo/core';
import { useComputedMetadata } from '../hooks/useComputedMetadata';
import { useLayout } from '../hooks/useLayout';

export type SchemaFormProps<
  TSchema extends ObjectSchema<any>,
  TData extends Infer<TSchema> = Infer<TSchema>
> = {
  schema: TSchema;
  onSubmit: (data: TData) => void | Promise<void>;
  submitText?: string;
  className?: string;
  /** Specify which layout to use (if schema has layouts defined) */
  layoutName?: string;
  /** Options for computed metadata behavior */
  computedMetadata?: {
    /** Debounce delay in milliseconds for computed metadata updates (default: 300ms) */
    debounceMs?: number;
  };
}

// Helper function to get the default value for a schema
function getDefaultValue(schema: BaseSchema<any>): any {
  if (schema._meta?.defaultValue !== undefined) {
    return schema._meta.defaultValue;
  }
  if (schema instanceof StringSchema) {
    return '';
  }
  if (schema instanceof NumberSchema) {
    return 0;
  }
  if (schema instanceof BooleanSchema) {
    return false;
  }
  // For complex types, return undefined and let the form handle it
  return undefined;
}

// Helper function to render the appropriate form control based on schema type
function renderFormControl(
  fieldName: string,
  schema: BaseSchema<any>,
  field: any,
  metadata?: any
) {
  // Use merged metadata if provided, otherwise fall back to schema metadata
  const fieldMetadata = metadata || schema._meta;
  
  const baseProps = {
    id: field.name,
    name: field.name,
    onBlur: field.handleBlur,
  };

  if (schema instanceof StringSchema) {
    return (
      <TextInput
        {...baseProps}
        type="text"
        value={field.state.value || ''}
        onChange={(e) => field.handleChange(e.target.value)}
        placeholder={fieldMetadata.description}
      />
    );
  }

  if (schema instanceof NumberSchema) {
    return (
      <TextInput
        {...baseProps}
        type="number"
        value={field.state.value || 0}
        onChange={(e) => field.handleChange(Number(e.target.value))}
        placeholder={fieldMetadata.description}
      />
    );
  }

  if (schema instanceof BooleanSchema) {
    return (
      <input
        {...baseProps}
        type="checkbox"
        checked={field.state.value || false}
        onChange={(e) => field.handleChange(e.target.checked)}
        className="w-4 h-4 rounded border-border focus:ring-2 focus:ring-primary/20"
      />
    );
  }

  // Fallback for unsupported types
  return (
    <TextInput
      {...baseProps}
      type="text"
      value={String(field.state.value || '')}
      onChange={(e) => field.handleChange(e.target.value)}
      placeholder="Unsupported field type"
    />
  );
}

export const SchemaForm = <
  TSchema extends ObjectSchema<any>
>({
  schema,
  onSubmit,
  submitText = 'Submit',
  className = '',
  layoutName,
  computedMetadata,
}: SchemaFormProps<TSchema>) => {
  // Create default values from schema
  const defaultValues = Object.entries(schema._shape).reduce((acc, [key, fieldSchema]) => {
    acc[key] = getDefaultValue(fieldSchema as BaseSchema<any>);
    return acc;
  }, {} as any);

  const form = useForm({
    defaultValues,
    listeners: {
      onChange: (formStateEvent) => {
        setFormState(formStateEvent.formApi.state.values);
      },
      onChangeDebounceMs:200
    },
    onSubmit: async ({ value }) => {
      try {
        // Parse the form data through the schema for validation
        const parsedData = schema.parse(value);
        await onSubmit(parsedData);
      } catch (error) {
        console.error('Form validation error:', error);
        // In a real app, you might want to handle this error differently
        throw error;
      }
    },
  });

  const [formState, setFormState] = useState(form.state.values);

  // Use computed metadata hook to get merged metadata
  const { metadata: mergedMetadata, isComputing, error: metadataError } = useComputedMetadata(
    schema,
    form.state.values,
    computedMetadata
  );

  // Use layout hook to get the layout (either specified or default)
  const layout = useLayout(schema, layoutName);

  return (
    <div className={className}>
      {metadataError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          <strong>Metadata Error:</strong> {metadataError.message}
        </div>
      )}
      
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        {/* Always render using layout configuration */}
        <div className={`layout-${layout.type} ${layout.className || ''}`}>
          {layout.groups.map((group, groupIndex) => (
            <div 
              key={groupIndex}
              className={`form-group ${group.className || ''} mb-6`}
            >
              {group.label && (
                <h3 className="text-lg font-medium mb-3">{group.label}</h3>
              )}
              {group.description && (
                <p className="text-sm text-gray-600 mb-3">{group.description}</p>
              )}
              <div className="space-y-4">
                {(() => {
                  // Group fields into rows based on their sizes
                  const rows: Array<typeof group.fields> = [];
                  let currentRow: typeof group.fields = [];
                  let currentRowWidth = 0;

                  group.fields.forEach((field) => {
                    if (field.hidden) return;
                    
                    const fieldSize = field.size || 12;
                    
                    // If adding this field would exceed 12, start a new row
                    if (currentRowWidth + fieldSize > 12 && currentRow.length > 0) {
                      rows.push([...currentRow]);
                      currentRow = [field];
                      currentRowWidth = fieldSize;
                    } else {
                      currentRow.push(field);
                      currentRowWidth += fieldSize;
                    }
                    
                    // If this field exactly fills the row, start a new row
                    if (currentRowWidth === 12) {
                      rows.push([...currentRow]);
                      currentRow = [];
                      currentRowWidth = 0;
                    }
                  });
                  
                  // Add any remaining fields in the last row
                  if (currentRow.length > 0) {
                    rows.push([...currentRow]);
                  }

                  return rows.map((row, rowIndex) => (
                    <div key={rowIndex} className="grid grid-cols-12 gap-4 w-full">
                      {row.map((field) => {
                        const fieldName = field.name as string;
                        const currentSchema = schema._shape[fieldName] as BaseSchema<any>;
                        const fieldMetadata = mergedMetadata[fieldName] || currentSchema._meta;
                        const fieldSize = field.size || 12;
                        
                        // Generate the correct col-span class based on size
                        const getColSpanClass = (size: number) => {
                          const colSpanMap: Record<number, string> = {
                            1: 'col-span-1',
                            2: 'col-span-2', 
                            3: 'col-span-3',
                            4: 'col-span-4',
                            5: 'col-span-5',
                            6: 'col-span-6',
                            7: 'col-span-7',
                            8: 'col-span-8',
                            9: 'col-span-9',
                            10: 'col-span-10',
                            11: 'col-span-11',
                            12: 'col-span-12'
                          };
                          return colSpanMap[size] || 'col-span-12';
                        };
                        
                        return (
                          <div 
                            key={fieldName}
                            className={`${getColSpanClass(fieldSize)} ${field.className || ''}`}
                          >
                            <form.Field
                              name={fieldName}
                              validators={{
                                onChange: ({ value }) => {
                                  try {
                                    currentSchema.parse(value);
                                    return undefined;
                                  } catch (error) {
                                    return error instanceof Error ? error.message : 'Invalid value';
                                  }
                                },
                              }}
                              children={(fieldState) => (
                                <FormControl
                                  label={fieldMetadata.label || fieldName}
                                  hint={fieldMetadata.description}
                                  field={fieldState}
                                  required={true}
                                >
                                  {renderFormControl(fieldName, currentSchema, fieldState, fieldMetadata)}
                                </FormControl>
                              )}
                            />
                          </div>
                        );
                      })}
                    </div>
                  ));
                })()}
              </div>
            </div>
          ))}
        </div>

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit || isComputing}>
              {isSubmitting ? 'Submitting...' : isComputing ? 'Computing...' : submitText}
            </Button>
          )}
        />
      </form>
    </div>
  );
};
