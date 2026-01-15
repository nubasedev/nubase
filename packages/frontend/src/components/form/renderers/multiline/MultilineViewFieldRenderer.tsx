import { useLayoutEffect, useRef } from "react";
import { cn } from "@/styling/cn";
import { textInputVariants } from "../../../form-controls/controls/TextInput/TextInput";
import type { ViewFieldRendererProps } from "../types";

/**
 * Adjusts the textarea height to fit its content without scrollbars.
 * Same function used in edit mode to ensure consistent height calculations.
 */
const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
};

export const MultilineViewFieldRenderer = ({
  fieldState,
}: ViewFieldRendererProps) => {
  const value = fieldState.state.value || "";
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize on initial render to match edit mode height calculation
  useLayoutEffect(() => {
    if (textareaRef.current) {
      adjustTextareaHeight(textareaRef.current);
    }
  });

  if (!value) {
    return (
      <div
        className={cn(
          "w-full min-w-0 px-3 py-1 rounded-md",
          "border border-transparent",
          "text-base text-foreground",
          "block whitespace-pre-wrap min-h-24",
        )}
      >
        <span className="text-muted-foreground italic">Empty</span>
      </div>
    );
  }

  // Use a readonly textarea styled to look like view mode
  // This ensures identical height calculations as edit mode
  return (
    <textarea
      ref={textareaRef}
      readOnly
      tabIndex={-1}
      value={value}
      className={cn(
        textInputVariants(),
        "min-h-24 resize-none overflow-hidden",
        // Override edit mode styles to look like view mode
        "border-transparent bg-transparent shadow-none cursor-text",
        "focus:border-transparent focus:ring-0 focus-visible:border-transparent focus-visible:ring-0",
      )}
      rows={3}
    />
  );
};
