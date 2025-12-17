import type { BaseSchema, SchemaMetadata } from "@nubase/core";
import type { AnyFieldApi } from "@tanstack/react-form";
import type React from "react";

type ViewFieldRendererProps = {
  schema: BaseSchema<any>;
  fieldState: AnyFieldApi;
  metadata: SchemaMetadata<any>;
};

type ViewFieldRenderer = (props: ViewFieldRendererProps) => React.ReactElement;

export const viewFieldRenderers: Record<string, ViewFieldRenderer> = {
  string: ({ fieldState }) => {
    const value = fieldState.state.value || "";
    return (
      <div className="flex h-9 w-full min-w-0 px-3 py-1 rounded-md border border-transparent text-base text-foreground">
        {value || <span className="text-muted-foreground italic">Empty</span>}
      </div>
    );
  },

  number: ({ fieldState }) => {
    const value = fieldState.state.value;
    return (
      <div className="flex h-9 w-full min-w-0 px-3 py-1 rounded-md border border-transparent text-base text-foreground">
        {value != null ? (
          value.toString()
        ) : (
          <span className="text-muted-foreground italic">Empty</span>
        )}
      </div>
    );
  },

  boolean: ({ fieldState }) => {
    const value = fieldState.state.value;
    return (
      <div className="flex h-9 w-full min-w-0 px-3 py-1 rounded-md border border-transparent text-base text-foreground">
        {value ? "Yes" : "No"}
      </div>
    );
  },
};

export const unsupportedViewRenderer: ViewFieldRenderer = ({ schema }) => {
  return (
    <div className="px-3 py-2 bg-destructive/10 text-destructive-foreground rounded-md">
      <div>Unsupported field type: {schema.type}</div>
    </div>
  );
};
