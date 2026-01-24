import type { CellViewRenderer } from "../types";

/**
 * Cell view renderer for number values.
 * Returns a formatted string representation for display in table cells.
 */
export const NumberCellViewRenderer: CellViewRenderer = ({ value }) => {
  if (value === null || value === undefined) {
    return "";
  }
  return typeof value === "number" ? value.toLocaleString() : String(value);
};
