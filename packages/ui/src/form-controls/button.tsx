import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 active:scale-95',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:bg-primary/90 focus:ring-primary/20 shadow-sm hover:-translate-y-0.5 active:translate-y-0',
        secondary: 'bg-surface text-text border border-border hover:bg-surface-hover hover:border-border/80 focus:ring-border/20 shadow-sm',
        outline: 'border border-primary bg-transparent text-primary hover:bg-primary/10 focus:ring-primary/20',
        ghost: 'bg-transparent text-text hover:bg-surface-hover focus:ring-text/10',
        destructive: 'bg-error text-white hover:bg-error/90 focus:ring-error/20 shadow-sm hover:-translate-y-0.5 active:translate-y-0',
      },
      size: {
        sm: 'text-xs px-3 py-2',
        md: 'text-sm px-4 py-3',
        lg: 'text-base px-6 py-4',
        icon: 'p-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
