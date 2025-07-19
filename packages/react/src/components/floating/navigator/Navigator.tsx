import { forwardRef } from "react";
import { SearchTextInput } from "../../form-controls/SearchTextInput/SearchTextInput";

export type NavigatorProps = {
  onClose?: () => void;
};

export const Navigator = forwardRef<HTMLInputElement, NavigatorProps>(
  ({ onClose }, ref) => {
    return (
      <div className="space-y-4">
        {/* Search Input */}
        <SearchTextInput
          ref={ref}
          placeholder="Search for commands, pages, or content..."
        />

        {/* Placeholder Content */}
        <div className="space-y-2">
          <div className="text-sm text-text-muted">Quick Actions</div>
          <div className="space-y-1">
            {[
              "Go to Dashboard",
              "Create New Item",
              "View Settings",
              "Open Documentation",
            ].map((item, index) => (
              <button
                key={index}
                type="button"
                className="flex items-center rounded-md px-3 py-2 text-sm text-text hover:bg-surface-subtle cursor-pointer w-full text-left"
                onClick={onClose}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Footer with keyboard hint */}
        <div className="border-t border-border pt-3">
          <div className="text-xs text-text-muted">
            Press{" "}
            <kbd className="px-1.5 py-0.5 bg-surface rounded text-xs">Esc</kbd>{" "}
            to close
          </div>
        </div>
      </div>
    );
  },
);

Navigator.displayName = "Navigator";
