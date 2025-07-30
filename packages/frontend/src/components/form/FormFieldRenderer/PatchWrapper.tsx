import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "../../buttons/Button/Button";
import type { EditFieldLifecycle } from "./renderer-factory";

interface PatchWrapperProps {
  children: React.ReactNode;
  isEditing: boolean;
  onStartEdit: () => void;
  onApply: () => Promise<void>;
  onCancel: () => void;
  editComponent: React.ReactNode;
  editFieldLifecycle?: EditFieldLifecycle;
  id?: string;
}

export const PatchWrapper: React.FC<PatchWrapperProps> = ({
  children,
  isEditing,
  onStartEdit,
  onApply,
  onCancel,
  editComponent,
  editFieldLifecycle,
  id,
}) => {
  const [isApplying, setIsApplying] = useState(false);

  // Trigger onEnterEdit lifecycle callback when entering edit mode
  useEffect(() => {
    if (isEditing && editFieldLifecycle?.onEnterEdit) {
      editFieldLifecycle.onEnterEdit();
    }
  }, [isEditing, editFieldLifecycle]);

  const handleApply = async () => {
    setIsApplying(true);
    try {
      await onApply();
    } finally {
      setIsApplying(false);
    }
  };

  if (isEditing) {
    return (
      <div className="relative" id={id}>
        {editComponent}
        <div className="absolute top-full left-0 z-50 flex gap-2 mt-2 p-2 bg-surface border border-outline rounded-lg shadow-xl">
          <Button variant="primary" onClick={handleApply} disabled={isApplying}>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-label="Apply changes"
            >
              <title>Apply</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </Button>
          <Button variant="secondary" onClick={onCancel} disabled={isApplying}>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-label="Cancel changes"
            >
              <title>Cancel</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="w-full text-left cursor-pointer rounded hover:bg-surfaceVariant transition-colors duration-200 border-none bg-transparent p-0"
      onClick={onStartEdit}
      aria-label="Click to edit"
      id={id}
    >
      {children}
    </button>
  );
};
