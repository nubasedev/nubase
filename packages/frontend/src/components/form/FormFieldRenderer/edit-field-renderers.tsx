import type { BaseSchema, SchemaMetadata } from "@nubase/core";
import type { AnyFieldApi } from "@tanstack/react-form";
import type React from "react";
import { useRef } from "react";
import { Checkbox } from "../../form-controls/controls/Checkbox/Checkbox";
import { TextInput } from "../../form-controls/controls/TextInput/TextInput";
import type { EditFieldLifecycle } from "./renderer-factory";

type FieldRendererProps = {
  schema: BaseSchema<any>;
  fieldState: AnyFieldApi;
  hasError: boolean;
  metadata: SchemaMetadata<any>;
};

type FieldRendererResult = {
  element: React.ReactElement<{ id?: string; hasError?: boolean }>;
  lifecycle?: EditFieldLifecycle;
};

type FieldRenderer = (props: FieldRendererProps) => FieldRendererResult;

export const editFieldRenderers: Record<string, FieldRenderer> = {
  string: ({ fieldState, hasError, metadata }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const hasSelectedRef = useRef(false);

    const lifecycle: EditFieldLifecycle = {
      onEnterEdit: () => {
        // Use setTimeout to ensure the input is rendered before focusing
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
            // Only select on the first enter, not on re-renders
            if (!hasSelectedRef.current) {
              inputRef.current.select();
              hasSelectedRef.current = true;
            }
          }
        }, 0);
      },
      onExitEdit: () => {
        // Reset the flag when exiting edit mode
        hasSelectedRef.current = false;
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
  },

  number: ({ fieldState, hasError, metadata }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const hasSelectedRef = useRef(false);

    const lifecycle: EditFieldLifecycle = {
      onEnterEdit: () => {
        // Use setTimeout to ensure the input is rendered before focusing
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
            // Only select on the first enter, not on re-renders
            if (!hasSelectedRef.current) {
              inputRef.current.select();
              hasSelectedRef.current = true;
            }
          }
        }, 0);
      },
      onExitEdit: () => {
        // Reset the flag when exiting edit mode
        hasSelectedRef.current = false;
      },
    };

    const element = (
      <TextInput
        ref={inputRef}
        id={fieldState.name}
        name={fieldState.name}
        onBlur={fieldState.handleBlur}
        type="number"
        value={fieldState.state.value ?? 0}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          fieldState.handleChange(Number(e.target.value))
        }
        placeholder={metadata.description}
        hasError={hasError}
      />
    );

    return { element, lifecycle };
  },

  boolean: ({ fieldState, hasError }) => {
    const element = (
      <Checkbox
        id={fieldState.name}
        name={fieldState.name}
        onBlur={fieldState.handleBlur}
        checked={fieldState.state.value ?? false}
        onCheckedChange={(checked: boolean) => fieldState.handleChange(checked)}
        hasError={hasError}
      />
    );

    return { element };
  },
};

export const unsupportedRenderer: FieldRenderer = ({ schema }) => {
  const element = (
    <div className="px-3 py-2 bg-destructive/10 text-destructive-foreground rounded-md">
      <div>Unsupported field type: {schema.type}</div>
    </div>
  );

  return { element };
};
