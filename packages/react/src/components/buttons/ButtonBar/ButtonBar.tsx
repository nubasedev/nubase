import type React from "react";
import { forwardRef } from "react";
import { cn } from "../../../utils";

export interface ButtonBarProps extends React.HTMLAttributes<HTMLDivElement> {
  alignment?: "left" | "center" | "right";
}

const ButtonBar = forwardRef<HTMLDivElement, ButtonBarProps>(
  ({ className, alignment = "right", children, ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex gap-2",
          {
            "justify-start": alignment === "left",
            "justify-center": alignment === "center",
            "justify-end": alignment === "right",
          },
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  },
);

ButtonBar.displayName = "ButtonBar";

export { ButtonBar };
