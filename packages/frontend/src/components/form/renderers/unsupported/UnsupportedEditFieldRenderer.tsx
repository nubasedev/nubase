import type { EditFieldRendererProps, EditFieldRendererResult } from "../types";

export const UnsupportedEditFieldRenderer = ({
  schema,
}: EditFieldRendererProps): EditFieldRendererResult => {
  const element = (
    <div className="px-3 py-2 bg-destructive/10 text-destructive-foreground rounded-md">
      <div>Unsupported field type: {schema.type}</div>
    </div>
  );

  return { element };
};
