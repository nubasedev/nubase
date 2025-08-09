import { Check, X } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator } from "../../activity-indicator";
import { Button } from "../../buttons/Button/Button";
import type { EditFieldLifecycle } from "./renderer-factory";

// Types for patch operations
export interface PatchResult {
  success: boolean;
  errors?: string[];
}

export type PatchFunction = () => Promise<PatchResult>;

export type EditComponentRenderer = (errors: string[]) => React.ReactNode;

interface PatchWrapperProps {
  children: React.ReactNode;
  isEditing: boolean;
  onStartEdit: () => void;
  onPatch: PatchFunction;
  onCancel: () => void;
  editComponent: EditComponentRenderer;
  editFieldLifecycle?: EditFieldLifecycle;
  id?: string;
}

export const PatchWrapper: React.FC<PatchWrapperProps> = ({
  children,
  isEditing,
  onStartEdit,
  onPatch,
  onCancel,
  editComponent,
  editFieldLifecycle,
  id,
}) => {
  const [isPatching, setIsPatching] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [hasUserModified, setHasUserModified] = useState(false);
  const prevIsEditingRef = useRef(isEditing);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleCancel = useCallback(() => {
    setValidationErrors([]);
    setHasUserModified(false);
    onCancel();
  }, [onCancel]);

  // Trigger lifecycle callbacks when entering/exiting edit mode
  useEffect(() => {
    const prevIsEditing = prevIsEditingRef.current;
    prevIsEditingRef.current = isEditing;

    // Entering edit mode
    if (isEditing && !prevIsEditing) {
      setValidationErrors([]);
      setHasUserModified(false);
      if (editFieldLifecycle?.onEnterEdit) {
        editFieldLifecycle.onEnterEdit();
      }
    }

    // Exiting edit mode
    if (!isEditing && prevIsEditing) {
      setValidationErrors([]);
      setHasUserModified(false);
      if (editFieldLifecycle?.onExitEdit) {
        editFieldLifecycle.onExitEdit();
      }
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
        handleCancel();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleCancel();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isEditing, handleCancel]);

  const handlePatch = async () => {
    setIsPatching(true);
    setHasUserModified(false);

    try {
      const result = await onPatch();

      if (result.success) {
        setValidationErrors([]);
        // Component will exit edit mode via parent state change
      } else {
        setValidationErrors(result.errors || []);
      }
    } catch (_error) {
      // Handle promise rejection with generic error
      setValidationErrors(["An unexpected error occurred. Please try again."]);
    } finally {
      setIsPatching(false);
    }
  };

  const handleUserModification = () => {
    if (!hasUserModified) {
      setHasUserModified(true);
      setValidationErrors([]); // Clear errors when user starts modifying
    }
  };

  if (isEditing) {
    const errorsToShow = hasUserModified ? [] : validationErrors;

    return (
      <div ref={wrapperRef} id={id}>
        <div onInput={handleUserModification} onChange={handleUserModification}>
          {editComponent(errorsToShow)}
        </div>

        {/* Network errors only - validation errors shown by FormControl */}
        {errorsToShow.length > 0 && (
          <div className="mt-2 space-y-1">
            {errorsToShow.map((error, index) => (
              <div key={index} className="text-destructive text-sm px-2">
                {error}
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 mt-2 p-2 bg-muted rounded-lg shadow-xl">
          <Button variant="default" onClick={handlePatch} disabled={isPatching}>
            {isPatching ? (
              <ActivityIndicator
                size="sm"
                color="inherit"
                aria-label="Patching..."
              />
            ) : (
              <Check className="w-4 h-4" aria-label="Apply changes" />
            )}
          </Button>
          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={isPatching}
          >
            <X className="w-4 h-4" aria-label="Cancel changes" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="w-full text-left cursor-pointer rounded hover:bg-muted transition-colors duration-200 border-none bg-transparent p-0"
      onClick={onStartEdit}
      aria-label="Click to edit"
      id={id}
    >
      {children}
    </button>
  );
};
