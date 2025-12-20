import type React from "react";
import { useRef } from "react";
import { cn } from "@/styling/cn";
import { textInputVariants } from "../../../form-controls/controls/TextInput/TextInput";
import type { EditFieldLifecycle } from "../../FormFieldRenderer/renderer-factory";
import type { EditFieldRendererProps, EditFieldRendererResult } from "../types";

export const MultilineEditFieldRenderer = ({
  fieldState,
  hasError,
  metadata,
}: EditFieldRendererProps): EditFieldRendererResult => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lifecycle: EditFieldLifecycle = {
    onEnterEdit: () => {
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 0);
    },
  };

  const element = (
    <textarea
      ref={textareaRef}
      id={fieldState.name}
      name={fieldState.name}
      onBlur={fieldState.handleBlur}
      value={fieldState.state.value ?? ""}
      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
        fieldState.handleChange(e.target.value)
      }
      placeholder={metadata.description}
      aria-invalid={hasError}
      className={cn(textInputVariants(), "h-auto min-h-24 py-2 resize-y")}
      rows={4}
    />
  );

  return { element, lifecycle };
};
