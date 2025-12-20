import type { ViewFieldRendererProps } from "../types";

export const BooleanViewFieldRenderer = ({
  fieldState,
}: ViewFieldRendererProps) => {
  const value = fieldState.state.value;
  return (
    <div className="flex w-full min-w-0 px-3 py-1 rounded-md border border-transparent text-base text-foreground">
      {value ? "Yes" : "No"}
    </div>
  );
};
