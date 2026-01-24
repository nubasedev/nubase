import type { ViewFieldRendererProps } from "../types";
import { ViewFieldWrapper } from "../ViewFieldWrapper";

export const BooleanViewFieldRenderer = ({
  fieldState,
}: ViewFieldRendererProps) => {
  const value = fieldState.state.value;
  return (
    <ViewFieldWrapper variant="singleLine">
      {value ? "Yes" : "No"}
    </ViewFieldWrapper>
  );
};
