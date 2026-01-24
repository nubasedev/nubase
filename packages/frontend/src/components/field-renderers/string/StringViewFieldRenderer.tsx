import { cn } from "@/styling/cn";
import { textInputVariants } from "../../form-controls/controls/TextInput/TextInput";
import type { ViewFieldRendererProps } from "../types";
import { EmptyValue, ViewFieldWrapper } from "../ViewFieldWrapper";

export const StringViewFieldRenderer = ({
  fieldState,
}: ViewFieldRendererProps) => {
  const value = fieldState.state.value || "";

  // For empty values, use the standard wrapper
  if (!value) {
    return (
      <ViewFieldWrapper variant="singleLine">
        <EmptyValue />
      </ViewFieldWrapper>
    );
  }

  // Use a readonly input styled to look like view mode
  // This ensures identical dimensions as edit mode
  return (
    <input
      type="text"
      readOnly
      tabIndex={-1}
      value={value}
      className={cn(
        textInputVariants(),
        // Override edit mode styles to look like view mode
        "border-transparent bg-transparent shadow-none cursor-text",
      )}
    />
  );
};
