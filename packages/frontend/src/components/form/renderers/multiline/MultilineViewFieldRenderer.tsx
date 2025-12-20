import type { ViewFieldRendererProps } from "../types";
import { EmptyValue, ViewFieldWrapper } from "../ViewFieldWrapper";

export const MultilineViewFieldRenderer = ({
  fieldState,
}: ViewFieldRendererProps) => {
  const value = fieldState.state.value || "";
  return (
    <ViewFieldWrapper variant="multiLine">
      {value || <EmptyValue />}
    </ViewFieldWrapper>
  );
};
