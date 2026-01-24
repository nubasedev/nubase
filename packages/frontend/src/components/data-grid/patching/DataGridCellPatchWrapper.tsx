import type { BaseSchema, SchemaMetadata } from "@nubase/core";
import { Check, X } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator } from "../../activity-indicator";
import { Button } from "../../buttons/Button/Button";
import type { PatchResult } from "../../form/FormFieldRenderer/PatchWrapper";
import type {
  CellEditLifecycle,
  CellEditRendererResult,
} from "./cell-renderers";

export type { PatchResult };

export interface DataGridCellPatchWrapperProps {
  /** The current value to edit */
  value: any;
  /** Schema for the field being edited */
  schema: BaseSchema<any>;
  /** Metadata for the field */
  metadata?: SchemaMetadata;
  /** Function to render the edit component */
  renderEditCell: (props: {
    value: any;
    onChange: (value: any) => void;
    hasError: boolean;
    metadata?: SchemaMetadata;
  }) => CellEditRendererResult;
  /** Callback when patch should be performed */
  onPatch: (value: any) => Promise<PatchResult>;
  /** Callback to close the editor */
  onClose: (commit: boolean) => void;
}

/**
 * DataGridCellPatchWrapper wraps cell editing with patch functionality.
 * It manages the edit state, validation, and patch submission similar to PatchWrapper
 * but optimized for table cell context.
 */
export const DataGridCellPatchWrapper: React.FC<
  DataGridCellPatchWrapperProps
> = ({
  value: initialValue,
  schema,
  metadata,
  renderEditCell,
  onPatch,
  onClose,
}) => {
  const [editValue, setEditValue] = useState(initialValue);
  const [isPatching, setIsPatching] = useState(false);
  const [patchError, setPatchError] = useState<string | null>(null);
  const lifecycleRef = useRef<CellEditLifecycle>({});
  const wrapperRef = useRef<HTMLDivElement>(null);
  const hasUserModified = useRef(false);

  // Render the edit component
  const editResult = renderEditCell({
    value: editValue,
    onChange: (newValue) => {
      setEditValue(newValue);
      hasUserModified.current = true;
      setPatchError(null); // Clear error when user modifies
    },
    hasError: !!patchError,
    metadata,
  });

  const { element, lifecycle, autoCommit } = editResult;

  // Store lifecycle for callbacks
  useEffect(() => {
    lifecycleRef.current = lifecycle || {};
  }, [lifecycle]);

  // Trigger onEnterEdit when component mounts
  useEffect(() => {
    lifecycleRef.current.onEnterEdit?.();
    return () => {
      lifecycleRef.current.onExitEdit?.();
    };
  }, []);

  /**
   * Handles the patch operation - validates and submits the value
   */
  const handlePatch = useCallback(
    async (valueToCommit?: unknown) => {
      const patchValue =
        valueToCommit !== undefined ? valueToCommit : editValue;

      setIsPatching(true);
      setPatchError(null);

      try {
        // Validate using schema if available
        if (schema) {
          const zodSchema = schema.toZod();
          const parseResult = zodSchema.safeParse(patchValue);
          if (!parseResult.success) {
            const errorMessage =
              parseResult.error.errors[0]?.message || "Invalid value";
            setPatchError(errorMessage);
            setIsPatching(false);
            return;
          }
        }

        const result = await onPatch(patchValue);

        if (result.success) {
          onClose(true);
        } else {
          setPatchError(result.errors?.join(", ") || "Failed to save");
        }
      } catch (error) {
        setPatchError(
          (error as Error).message || "An unexpected error occurred",
        );
      } finally {
        setIsPatching(false);
      }
    },
    [editValue, schema, onPatch, onClose],
  );

  /**
   * Handles cancellation - closes without committing
   */
  const handleCancel = useCallback(() => {
    onClose(false);
  }, [onClose]);

  // Set up auto-commit callback
  useEffect(() => {
    if (autoCommit && lifecycleRef.current) {
      lifecycleRef.current.onValueCommit = handlePatch;
    }
    return () => {
      if (lifecycleRef.current) {
        lifecycleRef.current.onValueCommit = undefined;
      }
    };
  }, [autoCommit, handlePatch]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !autoCommit) {
        e.preventDefault();
        e.stopPropagation();
        handlePatch();
      }
      // Escape is handled by DataGrid's EditCell
    };

    const wrapper = wrapperRef.current;
    if (wrapper) {
      wrapper.addEventListener("keydown", handleKeyDown);
      return () => wrapper.removeEventListener("keydown", handleKeyDown);
    }
  }, [handlePatch, autoCommit]);

  return (
    <div ref={wrapperRef} className="relative">
      {/* Edit component */}
      <div className="w-full">{element}</div>

      {/* Loading overlay for auto-commit */}
      {autoCommit && isPatching && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded">
          <ActivityIndicator size="sm" color="primary" aria-label="Saving..." />
        </div>
      )}

      {/* Inline error display for auto-commit fields */}
      {autoCommit && patchError && (
        <div className="absolute left-0 top-full mt-1 text-destructive text-xs bg-background p-1 rounded shadow z-20 whitespace-nowrap">
          {patchError}
        </div>
      )}

      {/* Floating action bar for non-auto-commit fields */}
      {!autoCommit && (
        <div className="absolute left-0 top-full mt-1 flex items-center gap-2 p-2 pr-3 bg-muted rounded-lg shadow-xl z-20">
          <Button
            variant="default"
            className="h-7 px-2"
            onClick={() => handlePatch()}
            disabled={isPatching}
          >
            {isPatching ? (
              <ActivityIndicator
                size="xs"
                color="inherit"
                aria-label="Saving..."
              />
            ) : (
              <Check className="w-4 h-4" aria-label="Save" />
            )}
          </Button>
          <Button
            variant="secondary"
            className="h-7 px-2"
            onClick={handleCancel}
            disabled={isPatching}
          >
            <X className="w-4 h-4" aria-label="Cancel" />
          </Button>

          {/* Error message */}
          {patchError && (
            <div className="text-destructive text-xs whitespace-nowrap">
              {patchError}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
