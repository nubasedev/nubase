import type { ViewFieldRendererProps } from "../types";

export const MultilineViewFieldRenderer = ({
  fieldState,
}: ViewFieldRendererProps) => {
  const value = fieldState.state.value || "";
  return (
    <div className="flex w-full min-w-0 px-3 py-1 rounded-md border border-transparent text-base text-foreground whitespace-pre-wrap">
      {value || <span className="text-muted-foreground italic">Empty</span>}
    </div>
  );
};
