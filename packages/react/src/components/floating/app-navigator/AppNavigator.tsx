import { IconSearch } from "@tabler/icons-react";
import type { FC } from "react";
import { useEffect, useRef } from "react";
import { Modal } from "../modal/Modal";

export type AppNavigatorProps = {
  open: boolean;
  onClose: () => void;
};

export const AppNavigator: FC<AppNavigatorProps> = ({ open, onClose }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      alignment="top"
      size="lg"
      showBackdrop={true}
      showCloseButton={false}
      className="max-h-96"
    >
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for commands, pages, or content..."
            className="w-full rounded-md border border-border bg-background pl-10 pr-4 py-3 text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

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
              <div
                key={index}
                className="flex items-center rounded-md px-3 py-2 text-sm text-text hover:bg-surface-subtle cursor-pointer"
              >
                {item}
              </div>
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
    </Modal>
  );
};
