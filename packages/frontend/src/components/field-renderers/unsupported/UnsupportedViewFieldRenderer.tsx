import type { ViewFieldRendererProps } from "../types";

export const UnsupportedViewFieldRenderer = ({
  schema,
}: ViewFieldRendererProps) => {
  return (
    <div className="px-3 py-2 bg-destructive/10 text-destructive-foreground rounded-md">
      <div>Unsupported field type: {schema.type}</div>
    </div>
  );
};
