import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";

const calloutVariants = cva(
  "rounded-md px-4 py-3 text-sm flex items-start gap-3",
  {
    variants: {
      variant: {
        info: "bg-muted text-foreground",
        danger: "bg-destructive/10 text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  },
);

export interface CalloutProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof calloutVariants> {
  /** The content to display in the callout */
  children: React.ReactNode;
  /** Optional icon to display */
  icon?: React.ReactNode;
}

export const Callout: React.FC<CalloutProps> = ({
  className,
  variant,
  children,
  icon,
  ...props
}) => {
  const defaultIcon =
    variant === "danger" ? (
      <svg
        className="h-5 w-5 flex-shrink-0 mt-0.5"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
          clipRule="evenodd"
        />
      </svg>
    ) : (
      <svg
        className="h-5 w-5 flex-shrink-0 mt-0.5"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
          clipRule="evenodd"
        />
      </svg>
    );

  return (
    <div className={calloutVariants({ variant, className })} {...props}>
      {icon || defaultIcon}
      <div className="flex-1">{children}</div>
    </div>
  );
};
