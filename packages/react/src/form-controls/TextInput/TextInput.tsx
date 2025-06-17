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
      hasError: {
        true: 'border-border-error focus:border-border-error focus:ring-error/10',
        false: '',
      },
    },
    defaultVariants: {
      size: 'md',
      hasError: false,
    },
  }
);

export interface TextInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  hasError?: boolean;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, size, hasError, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(inputVariants({ size, hasError }), className)}
        {...props}
      />
    );
  }
);

TextInput.displayName = 'TextInput';

export { TextInput, inputVariants };
