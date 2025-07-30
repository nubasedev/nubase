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
      <div className="px-3 py-2 text-onSurface">
        {value || <span className="text-onSurfaceVariant italic">Empty</span>}
      </div>
    );
  },

  number: ({ fieldState }) => {
    const value = fieldState.state.value;
    return (
      <div className="px-3 py-2 text-onSurface">
        {value != null ? (
          value.toString()
        ) : (
          <span className="text-onSurfaceVariant italic">Empty</span>
        )}
      </div>
    );
  },

  boolean: ({ fieldState }) => {
    const value = fieldState.state.value;
    return (
      <div className="px-3 py-2 text-onSurface">{value ? "Yes" : "No"}</div>
    );
  },
};

export const defaultViewRenderer: ViewFieldRenderer = ({ fieldState }) => {
  const value = fieldState.state.value;
  return (
    <div className="px-3 py-2 text-onSurface">
      {value != null ? (
        String(value)
      ) : (
        <span className="text-onSurfaceVariant italic">Empty</span>
      )}
    </div>
  );
};
