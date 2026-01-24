/**
 * Cell Renderers - Re-exports for backward compatibility
 *
 * Cell renderers are now co-located with field renderers in the field-renderers folder.
 * This file provides re-exports to maintain backward compatibility.
 */

export { BooleanCellEditRenderer } from "../../field-renderers/boolean/BooleanCellEditRenderer";
export { BooleanCellViewRenderer } from "../../field-renderers/boolean/BooleanCellViewRenderer";
export { NumberCellEditRenderer } from "../../field-renderers/number/NumberCellEditRenderer";
export { NumberCellViewRenderer } from "../../field-renderers/number/NumberCellViewRenderer";
export { StringCellEditRenderer } from "../../field-renderers/string/StringCellEditRenderer";
export { StringCellViewRenderer } from "../../field-renderers/string/StringCellViewRenderer";

// Re-export types
export type {
  CellEditLifecycle,
  CellEditRenderer,
  CellEditRendererMap,
  CellEditRendererProps,
  CellEditRendererResult,
  CellViewRenderer,
  CellViewRendererMap,
  CellViewRendererProps,
} from "../../field-renderers/types";

// Re-export factory functions
// Backward compatibility aliases
// The old resolveViewRenderer was a helper that resolved AND called the renderer
export {
  renderCellEdit,
  renderCellEdit as resolveEditRenderer,
  renderCellView,
  renderCellView as resolveViewRenderer,
  resolveCellEditRenderer,
  resolveCellViewRenderer,
} from "./cell-renderer-factory";
