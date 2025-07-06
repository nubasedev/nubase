import { cva } from "class-variance-authority";

// Component variants
export const mainNavVariants = cva(
  "flex flex-col h-full bg-surface border-r border-border",
  {
    variants: {
      width: {
        sm: "w-64",
        md: "w-72",
        lg: "w-80",
      },
    },
    defaultVariants: {
      width: "md",
    },
  },
);

export const searchVariants = cva(
  "w-full px-3 py-2 text-sm bg-background border border-border rounded-md transition-colors",
  {
    variants: {
      focused: {
        true: "border-border-focus ring-2 ring-border-focus/20",
        false:
          "hover:border-border/80 focus:border-border-focus focus:ring-2 focus:ring-border-focus/20",
      },
    },
    defaultVariants: {
      focused: false,
    },
  },
);

export const navItemVariants = cva(
  "flex items-center gap-3 px-3 py-2 text-sm font-medium transition-all duration-200 rounded-md group",
  {
    variants: {
      variant: {
        default: "text-text-muted hover:text-text hover:bg-surface-hover",
        active: "text-text bg-surface-hover border-l-2 border-l-primary",
        disabled: "text-text-placeholder cursor-not-allowed opacity-50",
      },
      level: {
        0: "ml-0",
        1: "ml-4",
        2: "ml-8",
        3: "ml-12",
      },
    },
    defaultVariants: {
      variant: "default",
      level: 0,
    },
  },
);
