import type { ViewFieldRendererProps } from "../types";

export const StringViewFieldRenderer = ({
  fieldState,
}: ViewFieldRendererProps) => {
  const value = fieldState.state.value || "";
  return (
    <div className="flex items-center h-9 w-full min-w-0 px-3 py-1 rounded-md border border-transparent text-base text-foreground">
      {value || <span className="text-muted-foreground italic">Empty</span>}
    </div>
  );
};
