import type {
  CalculatedColumn,
  CalculatedColumnOrColumnGroup,
  Maybe,
} from "../types";

export { getColSpan } from "./colSpanUtils";
export { scrollIntoView, stopPropagation } from "./domUtils";
export { createCellEvent } from "./eventUtils";
export {
  getLeftRightKey,
  isCtrlKeyHeldDown,
  isDefaultCellInput,
  onEditorNavigation,
} from "./keyboardUtils";
export { renderMeasuringCells } from "./renderMeasuringCells";
export {
  canExitGrid,
  getNextSelectedCellPosition,
  isCellEditableUtil,
  isSelectedCellEditable,
} from "./selectedCellUtils";
export {
  getCellClassname,
  getCellStyle,
  getHeaderCellStyle,
  getRowStyle,
} from "./styleUtils";

export const { min, max, floor, sign, abs } = Math;

export function assertIsValidKeyGetter<R, K extends React.Key>(
  keyGetter: Maybe<(row: NoInfer<R>) => K>,
): asserts keyGetter is (row: R) => K {
  if (typeof keyGetter !== "function") {
    throw new Error("Please specify the rowKeyGetter prop to use selection");
  }
}

export function clampColumnWidth<R, SR>(
  width: number,
  { minWidth, maxWidth }: CalculatedColumn<R, SR>,
): number {
  width = max(width, minWidth);

  // ignore maxWidth if it less than minWidth
  if (typeof maxWidth === "number" && maxWidth >= minWidth) {
    return min(width, maxWidth);
  }

  return width;
}

export function getHeaderCellRowSpan<R, SR>(
  column: CalculatedColumnOrColumnGroup<R, SR>,
  rowIdx: number,
) {
  return column.parent === undefined
    ? rowIdx
    : column.level - column.parent.level;
}
