import React, { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils';
import { Label } from '../Label/Label';
import { AnyFieldApi } from '@tanstack/react-form';

const formControlVariants = cva(
  'flex flex-col gap-1',
  {
    variants: {
      spacing: {
        sm: 'gap-1',
        md: 'gap-2',
        lg: 'gap-3',
      },
    },
    defaultVariants: {
      spacing: 'sm',
    },
  }
);

export interface FormControlProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  spacing?: 'sm' | 'md' | 'lg';
  children: React.ReactElement<{ id?: string; hasError?: boolean }>;
  field?: AnyFieldApi; // Optional field for TanStack form integration
}

const FormControl = forwardRef<HTMLDivElement, FormControlProps>(
  ({ className, label, hint, error, required, spacing, children, field, ...props }, ref) => {
    // Determine error state - prioritize explicit error, then field errors
    let displayError = error;
    let hasError = !!error;
    let isValidating = false;

    if (field) {
      isValidating = field.state.meta.isValidating;
      if (!error && field.state.meta.isTouched && !field.state.meta.isValid) {
        displayError = field.state.meta.errors.join(', ');
        hasError = true;
      }
    }

    const childId = children.props.id;
    
    // Clone the child element and pass hasError prop if it accepts it
    const childWithError = React.cloneElement(children, {
      hasError,
      'aria-invalid': hasError ? 'true' : undefined,
      'aria-describedby': displayError ? `${childId}-error` : hint ? `${childId}-hint` : undefined,
    } as any);

    return (
      <div
        ref={ref}
        className={cn(formControlVariants({ spacing }), className)}
        {...props}
      >
        {label && (
          <Label htmlFor={childId} required={required}>
            {label}
          </Label>
        )}
        {childWithError}
        {hint && !hasError && !isValidating && (
          <div id={`${childId}-hint`} className="text-xs text-text-muted">
            {hint}
          </div>
        )}
        {isValidating && (
          <div className="text-xs text-text-muted">
            Validating...
          </div>
        )}
        {hasError && displayError && (
          <div id={`${childId}-error`} className="text-xs text-error">
            {displayError}
          </div>
        )}
      </div>
    );
  }
);

FormControl.displayName = 'FormControl';

export { FormControl };
