import { measuringCellClassname } from "../styles";
import type { CalculatedColumn } from "../types";

export function renderMeasuringCells<R, SR>(
  viewportColumns: readonly CalculatedColumn<R, SR>[],
) {
  return viewportColumns.map(({ key, idx, minWidth, maxWidth }) => (
    <div
      key={key}
      className={measuringCellClassname}
      style={{ gridColumnStart: idx + 1, minWidth, maxWidth }}
      data-measuring-cell-key={key}
    />
  ));
}
