import { useForm } from '@tanstack/react-form';
import type { FC } from 'react';
import { TextInput, Button, FormControl } from '../form-controls';
import { ObjectSchema, ObjectShape, StringSchema, NumberSchema, BooleanSchema, BaseSchema, ObjectOutput } from '@repo/core';

export type SchemaFormProps<TShape extends ObjectShape> = {
  schema: ObjectSchema<TShape>;
  onSubmit: (data: ObjectOutput<TShape>) => void | Promise<void>;
  submitText?: string;
  className?: string;
}

// Helper function to get the default value for a schema
function getDefaultValue(schema: BaseSchema<any>): any {
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
  field: any
) {
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
        placeholder={schema._meta.description}
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
        placeholder={schema._meta.description}
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

export const SchemaForm = <TShape extends ObjectShape>({
  schema,
  onSubmit,
  submitText = 'Submit',
  className = '',
}: SchemaFormProps<TShape>) => {
  // Create default values from schema
  const defaultValues = Object.entries(schema._shape).reduce((acc, [key, fieldSchema]) => {
    acc[key] = getDefaultValue(fieldSchema);
    return acc;
  }, {} as any);

  const form = useForm({
    defaultValues,
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

  return (
    <div className={className}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        {Object.entries(schema._shape).map(([fieldName, fieldSchema]) => (
          <form.Field
            key={fieldName}
            name={fieldName}
            validators={{
              onChange: ({ value }) => {
                try {
                  fieldSchema.parse(value);
                  return undefined;
                } catch (error) {
                  return error instanceof Error ? error.message : 'Invalid value';
                }
              },
            }}
            children={(field) => (
              <FormControl
                label={fieldSchema._meta.label || fieldName}
                hint={fieldSchema._meta.description}
                field={field}
                required={true} // You might want to make this configurable based on schema
              >
                {renderFormControl(fieldName, fieldSchema, field)}
              </FormControl>
            )}
          />
        ))}

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit}>
              {isSubmitting ? 'Submitting...' : submitText}
            </Button>
          )}
        />
      </form>
    </div>
  );
};
