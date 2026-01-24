import { useLayoutEffect, useRef } from "react";
import { cn } from "@/styling/cn";
import { textInputVariants } from "../../form-controls/controls/TextInput/TextInput";
import type { ViewFieldRendererProps } from "../types";
import { EmptyValue, ViewFieldWrapper } from "../ViewFieldWrapper";

/**
 * Sets the textarea height to match its content.
 * This ensures the view textarea has the same height as the edit textarea.
 */
const setTextareaHeight = (textarea: HTMLTextAreaElement) => {
  textarea.style.height = `${textarea.scrollHeight}px`;
};

export const MultilineViewFieldRenderer = ({
  fieldState,
}: ViewFieldRendererProps) => {
  const value = fieldState.state.value || "";
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize to match content - ensures same height as edit mode textarea
  useLayoutEffect(() => {
    if (textareaRef.current) {
      setTextareaHeight(textareaRef.current);
    }
  });

  // For empty values, use the standard wrapper
  if (!value) {
    return (
      <ViewFieldWrapper variant="multiLine">
        <EmptyValue />
      </ViewFieldWrapper>
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
