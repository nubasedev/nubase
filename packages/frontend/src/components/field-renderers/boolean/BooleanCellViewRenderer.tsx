import type { CellViewRenderer } from "../types";

/**
 * Cell view renderer for boolean values.
 * Returns a simple "Yes" or "No" string for display in table cells.
 */
export const BooleanCellViewRenderer: CellViewRenderer = ({ value }) => {
  return value ? "Yes" : "No";
};
