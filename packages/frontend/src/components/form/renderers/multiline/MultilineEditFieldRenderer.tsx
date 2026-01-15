import type React from "react";
import { useLayoutEffect, useRef } from "react";
import { cn } from "@/styling/cn";
import { textInputVariants } from "../../../form-controls/controls/TextInput/TextInput";
import type { EditFieldLifecycle } from "../../FormFieldRenderer/renderer-factory";
import type { EditFieldRendererProps, EditFieldRendererResult } from "../types";

/**
 * Adjusts the textarea height to fit its content without scrollbars.
 * Setting height to 'auto' first resets the height so scrollHeight is recalculated.
 */
const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
};

/**
 * Sets the initial textarea height without the 'auto' reset.
 * This prevents a layout flash on initial mount since we go directly to the correct height.
 */
const setInitialTextareaHeight = (textarea: HTMLTextAreaElement) => {
  textarea.style.height = `${textarea.scrollHeight}px`;
};

export const MultilineEditFieldRenderer = ({
  fieldState,
  hasError,
  metadata,
}: EditFieldRendererProps): EditFieldRendererResult => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize on initial render - useLayoutEffect runs synchronously before paint to prevent flicker
  // Use setInitialTextareaHeight (no 'auto' reset) to prevent a flash during initial mount
  useLayoutEffect(() => {
    if (textareaRef.current) {
      setInitialTextareaHeight(textareaRef.current);
    }
  }, []);

  const lifecycle: EditFieldLifecycle = {
    onEnterEdit: () => {
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          // Move cursor to the end
          const length = textareaRef.current.value.length;
          textareaRef.current.setSelectionRange(length, length);
          adjustTextareaHeight(textareaRef.current);
        }
      }, 0);
    },
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    fieldState.handleChange(e.target.value);
    adjustTextareaHeight(e.target);
  };

  const element = (
    <textarea
      ref={textareaRef}
      id={fieldState.name}
      name={fieldState.name}
      onBlur={fieldState.handleBlur}
      value={fieldState.state.value ?? ""}
      onChange={handleChange}
      placeholder={metadata.description}
      aria-invalid={hasError}
      className={cn(
        textInputVariants(),
        "min-h-24 resize-none overflow-hidden",
      )}
      rows={3}
    />
  );

  return { element, lifecycle };
};
