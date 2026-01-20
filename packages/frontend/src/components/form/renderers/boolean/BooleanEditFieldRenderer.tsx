import { Toggle } from "../../../form-controls/controls/Toggle/Toggle";
import type { EditFieldLifecycle } from "../../FormFieldRenderer/renderer-factory";
import type { EditFieldRendererProps, EditFieldRendererResult } from "../types";

export const BooleanEditFieldRenderer = ({
  fieldState,
  hasError,
}: EditFieldRendererProps): EditFieldRendererResult => {
  // Create a mutable lifecycle object that PatchWrapper will populate with onValueCommit
  const lifecycle: EditFieldLifecycle = {};

  const element = (
    <Toggle
      id={fieldState.name}
      name={fieldState.name}
      onBlur={fieldState.handleBlur}
      checked={fieldState.state.value ?? false}
      onCheckedChange={(checked: boolean) => {
        fieldState.handleChange(checked);
        // Pass the value directly to onValueCommit to avoid relying on form state timing
        lifecycle.onValueCommit?.(checked);
      }}
      hasError={hasError}
    />
  );

  return { element, lifecycle, autoCommit: true };
};
