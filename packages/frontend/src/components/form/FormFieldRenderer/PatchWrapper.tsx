import { IconCheck, IconX } from "@tabler/icons-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
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
  const prevIsEditingRef = useRef(isEditing);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Trigger lifecycle callbacks when entering/exiting edit mode
  useEffect(() => {
    const prevIsEditing = prevIsEditingRef.current;
    prevIsEditingRef.current = isEditing;

    // Entering edit mode
    if (isEditing && !prevIsEditing && editFieldLifecycle?.onEnterEdit) {
      editFieldLifecycle.onEnterEdit();
    }

    // Exiting edit mode
    if (!isEditing && prevIsEditing && editFieldLifecycle?.onExitEdit) {
      editFieldLifecycle.onExitEdit();
    }
  }, [isEditing, editFieldLifecycle]);

  // Handle click outside and ESC key to cancel
  useEffect(() => {
    if (!isEditing) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        onCancel();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isEditing, onCancel]);

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
      <div ref={wrapperRef} id={id}>
        {editComponent}
        <div className="flex gap-2 mt-2 p-2 bg-surfaceVariant rounded-lg shadow-xl">
          <Button variant="primary" onClick={handleApply} disabled={isApplying}>
            <IconCheck className="w-4 h-4" aria-label="Apply changes" />
          </Button>
          <Button variant="secondary" onClick={onCancel} disabled={isApplying}>
            <IconX className="w-4 h-4" aria-label="Cancel changes" />
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
