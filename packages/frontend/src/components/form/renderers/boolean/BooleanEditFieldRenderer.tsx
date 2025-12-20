import { Checkbox } from "../../../form-controls/controls/Checkbox/Checkbox";
import type { EditFieldRendererProps, EditFieldRendererResult } from "../types";

export const BooleanEditFieldRenderer = ({
  fieldState,
  hasError,
}: EditFieldRendererProps): EditFieldRendererResult => {
  const element = (
    <Checkbox
      id={fieldState.name}
      name={fieldState.name}
      onBlur={fieldState.handleBlur}
      checked={fieldState.state.value ?? false}
      onCheckedChange={(checked: boolean) => fieldState.handleChange(checked)}
      hasError={hasError}
    />
  );

  return { element };
};
