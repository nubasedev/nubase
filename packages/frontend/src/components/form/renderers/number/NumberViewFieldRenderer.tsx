import type { ViewFieldRendererProps } from "../types";
import { EmptyValue, ViewFieldWrapper } from "../ViewFieldWrapper";

export const NumberViewFieldRenderer = ({
  fieldState,
}: ViewFieldRendererProps) => {
  const value = fieldState.state.value;
  return (
    <ViewFieldWrapper variant="singleLine">
      {value != null ? value.toString() : <EmptyValue />}
    </ViewFieldWrapper>
  );
};
