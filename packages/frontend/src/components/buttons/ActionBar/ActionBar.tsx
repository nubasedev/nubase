import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";
import { forwardRef } from "react";
import { cn } from "../../../utils";

export interface ActionBarAction {
  id: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  label?: string;
  onClick: () => void;
  disabled?: boolean;
}

export interface ActionBarGroup {
  id: string;
  actions: ActionBarAction[];
}

const actionBarVariants = cva("flex items-center gap-1 text-sm font-medium", {
  variants: {
    variant: {
      default: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const actionVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
  {
    variants: {
      variant: {
        default: "text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const separatorVariants = cva("bg-border w-[1px] h-6 mx-2 opacity-60");

export interface ActionBarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof actionBarVariants> {
  groups: ActionBarGroup[];
}

const ActionBar = forwardRef<HTMLDivElement, ActionBarProps>(
  ({ className, variant, groups, ...props }, ref) => {
    return (
      <div
        className={cn(actionBarVariants({ variant, className }))}
        ref={ref}
        role="toolbar"
        {...props}
      >
        {groups.map((group, groupIndex) => (
          <div key={group.id} className="flex items-center">
            {groupIndex > 0 && <div className={cn(separatorVariants())} />}
            <div className="flex items-center gap-0.5">
              {group.actions.map((action) => {
                const {
                  icon: IconComponent,
                  label,
                  onClick,
                  disabled,
                  id,
                } = action;

                if (!IconComponent && !label) {
                  console.warn(
                    `ActionBar action with id "${id}" has neither icon nor label. At least one is required.`,
                  );
                  return null;
                }

                return (
                  <button
                    key={id}
                    type="button"
                    className={cn(actionVariants())}
                    onClick={onClick}
                    disabled={disabled}
                    aria-label={label || `Action ${id}`}
                    title={label}
                  >
                    {IconComponent && <IconComponent size={16} />}
                    {label && <span>{label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  },
);

ActionBar.displayName = "ActionBar";

export { ActionBar, actionBarVariants };
