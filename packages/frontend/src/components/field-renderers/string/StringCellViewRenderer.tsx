import type { CellViewRenderer } from "../types";

/**
 * Cell view renderer for string values.
 * Returns a simple string representation for display in table cells.
 */
export const StringCellViewRenderer: CellViewRenderer = ({ value }) => {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value);
};
