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
  hint?: string;
  validationError?: string;
  isValidating?: boolean;
}

// Threshold in pixels - if mouse moves more than this, it's a selection not a click
const SELECTION_THRESHOLD = 5;

export const PatchWrapper: React.FC<PatchWrapperProps> = ({
  children,
  isEditing,
  onStartEdit,
  onPatch,
  onCancel,
  editComponent,
  editFieldLifecycle,
  id,
  hint,
  validationError,
  isValidating,
}) => {
  const [isPatching, setIsPatching] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [hasUserModified, setHasUserModified] = useState(false);
  const prevIsEditingRef = useRef(isEditing);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mouseDownPosRef = useRef<{ x: number; y: number } | null>(null);

  /**
   * Resets the local state and delegates to the parent's cancel handler.
   * Called when user clicks outside, presses ESC, or clicks the cancel button.
   */
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

  /**
   * Submits the current field value to the server via the onPatch callback.
   * Handles loading state, success/error responses, and displays validation errors.
   */
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

  /**
   * Tracks when the user starts modifying the field value.
   * Clears any existing validation errors to give the user a fresh start.
   */
  const handleUserModification = () => {
    if (!hasUserModified) {
      setHasUserModified(true);
      setValidationErrors([]); // Clear errors when user starts modifying
    }
  };

  /**
   * Records the mouse position when the user starts pressing.
   * Used to distinguish between a click and a text selection drag.
   */
  const handleMouseDown = (e: React.MouseEvent) => {
    mouseDownPosRef.current = { x: e.clientX, y: e.clientY };
  };

  /**
   * Determines whether the user clicked or dragged to select text.
   * If the mouse moved less than SELECTION_THRESHOLD pixels, it's a click and we enter edit mode.
   * If the mouse moved more, the user is selecting text, so we don't enter edit mode.
   * This mimics Jira's inline edit behavior.
   */
  const handleMouseUp = (e: React.MouseEvent) => {
    if (!mouseDownPosRef.current) return;

    const deltaX = Math.abs(e.clientX - mouseDownPosRef.current.x);
    const deltaY = Math.abs(e.clientY - mouseDownPosRef.current.y);
    const didMove =
      deltaX > SELECTION_THRESHOLD || deltaY > SELECTION_THRESHOLD;

    mouseDownPosRef.current = null;

    // Only enter edit mode if it was a click (no significant mouse movement)
    if (!didMove) {
      onStartEdit();
    }
  };

  // Compute error/hint display state
  const errorsToShow = hasUserModified ? [] : validationErrors;
  const showNetworkErrors = errorsToShow.length > 0;
  const showValidationError =
    !showNetworkErrors && validationError && !hasUserModified;
  const showValidating =
    !showNetworkErrors && !showValidationError && isValidating;
  const showHint =
    !showNetworkErrors && !showValidationError && !showValidating && hint;

  // Always render both view and edit elements, use CSS to show/hide
  // This prevents layout shift when switching modes since both elements stay mounted
  // We use visibility:hidden + absolute positioning instead of display:none so that
  // the hidden element is still laid out (allowing scrollHeight calculations to work)
  return (
    <div ref={wrapperRef} id={id} className="relative">
      {/* View mode - clickable wrapper */}
      {/* biome-ignore lint/a11y/useSemanticElements: div required for text selection, button would prevent it */}
      <div
        className={`w-full text-left cursor-text rounded hover:bg-muted transition-colors duration-200 select-text ${isEditing ? "invisible absolute inset-0" : ""}`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        role="button"
        tabIndex={isEditing ? -1 : 0}
        aria-label="Click to edit"
        aria-hidden={isEditing}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onStartEdit();
          }
        }}
      >
        {children}
      </div>

      {/* Edit mode - input wrapper */}
      {/* Use visibility:hidden instead of display:none so scrollHeight works for textarea auto-sizing */}
      <div
        className={isEditing ? "" : "invisible absolute inset-0"}
        onInput={handleUserModification}
        onChange={handleUserModification}
        aria-hidden={!isEditing}
      >
        {editComponent(errorsToShow)}
      </div>

      {/* Floating action bar - only visible in edit mode */}
      {isEditing && (
        <div className="absolute left-0 top-full mt-2 flex items-center gap-2 p-2 bg-muted rounded-lg shadow-xl z-10">
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

          {/* Hint, validation, or error message */}
          {showNetworkErrors && (
            <div className="text-destructive text-xs">
              {errorsToShow.join(", ")}
            </div>
          )}
          {showValidationError && (
            <div className="text-destructive text-xs">{validationError}</div>
          )}
          {showValidating && (
            <div className="text-muted-foreground text-xs">Validating...</div>
          )}
          {showHint && (
            <div className="text-muted-foreground text-xs">{hint}</div>
          )}
        </div>
      )}
    </div>
  );
};
