import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils';

const inputVariants = cva(
  'w-full appearance-none bg-surface border border-border rounded-md text-text text-sm leading-normal outline-none transition-all duration-200 placeholder:text-text-placeholder focus:border-border-focus focus:ring-4 focus:ring-primary/10 disabled:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60',
  {
    variants: {
      size: {
        sm: 'px-3 py-2 text-xs',
        md: 'px-4 py-3 text-sm',
        lg: 'px-4 py-4 text-base',
      },
      variant: {
        default: '',
        error: 'border-border-error focus:border-border-error focus:ring-error/10',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

const labelVariants = cva(
  'block text-sm font-medium text-text mb-2',
  {
    variants: {
      variant: {
        default: '',
        required: "after:content-['*'] after:text-error after:ml-1",
        muted: 'text-text-muted font-normal',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface TextInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, size, variant, label, hint, error, required, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;
    const finalVariant = hasError ? 'error' : variant;
    const labelVariant = required ? 'required' : 'default';

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className={labelVariants({ variant: labelVariant })}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(inputVariants({ size, variant: finalVariant }), className)}
          {...props}
        />
        {hint && !hasError && (
          <div className="text-xs text-text-muted mt-1">{hint}</div>
        )}
        {hasError && (
          <div className="text-xs text-error mt-1">{error}</div>
        )}
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';

export { TextInput, inputVariants };
