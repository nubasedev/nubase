import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";
import { cn } from "@/styling/cn";

const viewFieldWrapperVariants = cva(
  [
    // Base styles shared by all view field renderers
    "flex w-full min-w-0 px-3 py-1 rounded-md",
    "border border-transparent",
    "text-base text-foreground",
  ],
  {
    variants: {
      variant: {
        // Single line fields (string, number, boolean) - fixed height to match TextInput
        singleLine: "items-center h-9",
        // Multi-line fields - flexible height with whitespace preservation
        multiLine: "whitespace-pre-wrap",
      },
    },
    defaultVariants: {
      variant: "singleLine",
    },
  },
);

export interface ViewFieldWrapperProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof viewFieldWrapperVariants> {
  children: React.ReactNode;
}

export const ViewFieldWrapper: React.FC<ViewFieldWrapperProps> = ({
  children,
  variant,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(viewFieldWrapperVariants({ variant }), className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const EmptyValue: React.FC = () => (
  <span className="text-muted-foreground italic">Empty</span>
);
