import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import type React from "react";

const activityIndicatorVariants = cva("animate-spin", {
  variants: {
    size: {
      xs: "w-3 h-3",
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
      xl: "w-8 h-8",
    },
    color: {
      primary: "text-primary",
      secondary: "text-secondary",
      surface: "text-foreground",
      surfaceVariant: "text-muted-foreground",
      inherit: "text-inherit",
    },
  },
  defaultVariants: {
    size: "md",
    color: "inherit",
  },
});

export interface ActivityIndicatorProps
  extends VariantProps<typeof activityIndicatorVariants> {
  className?: string;
  "aria-label"?: string;
}

export const ActivityIndicator: React.FC<ActivityIndicatorProps> = ({
  size,
  color,
  className,
  "aria-label": ariaLabel = "Loading...",
}) => {
  return (
    <Loader2
      className={activityIndicatorVariants({ size, color, className })}
      aria-label={ariaLabel}
    />
  );
};
