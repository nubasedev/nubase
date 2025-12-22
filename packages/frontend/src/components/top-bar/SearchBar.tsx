import { Search } from "lucide-react";
import type React from "react";
import { forwardRef } from "react";
import type { NubaseContextData } from "../../context/types";
import { cn } from "../../styling/cn";

export interface SearchBarProps
  extends Omit<React.ComponentProps<"button">, "onClick"> {
  context: NubaseContextData;
  placeholder?: string;
}

/**
 * SearchBar component that triggers the command palette when clicked.
 * Provides a unified search interface for all commands in the application.
 */
const SearchBar = forwardRef<HTMLButtonElement, SearchBarProps>(
  (
    { className, context, placeholder = "Search commands...", ...props },
    ref,
  ) => {
    const handleClick = () => {
      context.commands.execute("workbench.runCommand");
    };

    return (
      <button
        ref={ref}
        type="button"
        data-testid="command-palette-trigger"
        className={cn(
          "flex items-center gap-2 px-3 py-2 min-w-0 flex-1 max-w-md cursor-pointer transition-colors",
          "bg-background border border-border rounded-md",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          className,
        )}
        onClick={handleClick}
        aria-label="Open command palette"
        {...props}
      >
        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-sm text-muted-foreground truncate">
          {placeholder}
        </span>
        <div className="ml-auto text-xs text-muted-foreground font-mono">
          ⌘K
        </div>
      </button>
    );
  },
);

SearchBar.displayName = "SearchBar";

export { SearchBar };
