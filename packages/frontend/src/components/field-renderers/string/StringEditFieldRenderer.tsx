import type React from "react";
import { useRef } from "react";
import type { EditFieldLifecycle } from "../../form/FormFieldRenderer/renderer-factory";
import { TextInput } from "../../form-controls/controls/TextInput/TextInput";
import type { EditFieldRendererProps, EditFieldRendererResult } from "../types";

export const StringEditFieldRenderer = ({
  fieldState,
  hasError,
  metadata,
}: EditFieldRendererProps): EditFieldRendererResult => {
  const inputRef = useRef<HTMLInputElement>(null);

  const lifecycle: EditFieldLifecycle = {
    onEnterEdit: () => {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 0);
    },
  };

  const element = (
    <TextInput
      ref={inputRef}
      id={fieldState.name}
      name={fieldState.name}
      onBlur={fieldState.handleBlur}
      type="text"
      value={fieldState.state.value ?? ""}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        fieldState.handleChange(e.target.value)
      }
      placeholder={metadata.description}
      hasError={hasError}
    />
  );

  return { element, lifecycle };
};
