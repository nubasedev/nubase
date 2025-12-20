import type { ViewFieldRendererProps } from "../types";
import { EmptyValue, ViewFieldWrapper } from "../ViewFieldWrapper";

export const StringViewFieldRenderer = ({
  fieldState,
}: ViewFieldRendererProps) => {
  const value = fieldState.state.value || "";
  return (
    <ViewFieldWrapper variant="singleLine">
      {value || <EmptyValue />}
    </ViewFieldWrapper>
  );
};
