import { Toggle } from "../../form-controls/controls/Toggle/Toggle";
import type {
  CellEditLifecycle,
  CellEditRenderer,
  CellEditRendererResult,
} from "../types";

/**
 * Cell edit renderer for boolean values.
 * Provides a toggle switch for editing booleans in table cells.
 * Auto-commits on change - no save button needed.
 */
export const BooleanCellEditRenderer: CellEditRenderer = ({
  value,
  onChange,
  hasError,
}): CellEditRendererResult => {
  // Create a mutable lifecycle object that will be populated with onValueCommit
  const lifecycle: CellEditLifecycle = {};

  const element = (
    <Toggle
      checked={value ?? false}
      onCheckedChange={(checked: boolean) => {
        onChange(checked);
        // Pass the value directly to onValueCommit to avoid timing issues
        lifecycle.onValueCommit?.(checked);
      }}
      hasError={hasError}
    />
  );

  return { element, lifecycle, autoCommit: true };
};
