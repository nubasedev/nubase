import { memo } from "react";

import { useRovingTabIndex } from "./hooks/useRovingTabIndex";
import { summaryCellClassname } from "./styles";
import type { CellRendererProps } from "./types";
import { getCellClassname, getCellStyle } from "./utils";

type SharedCellRendererProps<R, SR> = Pick<
  CellRendererProps<R, SR>,
  "rowIdx" | "column" | "colSpan" | "isCellSelected" | "selectCell"
>;

interface SummaryCellProps<R, SR> extends SharedCellRendererProps<R, SR> {
  row: SR;
}

function SummaryCell<R, SR>({
  column,
  colSpan,
  row,
  rowIdx,
  isCellSelected,
  selectCell,
}: SummaryCellProps<R, SR>) {
  const { tabIndex, childTabIndex, onFocus } =
    useRovingTabIndex(isCellSelected);
  const { summaryCellClass } = column;
  const className = getCellClassname(
    column,
    summaryCellClassname,
    typeof summaryCellClass === "function"
      ? summaryCellClass(row)
      : summaryCellClass,
  );

  function onMouseDown() {
    selectCell({ rowIdx, idx: column.idx });
  }

  return (
    <div
      role="gridcell"
      aria-colindex={column.idx + 1}
      aria-colspan={colSpan}
      aria-selected={isCellSelected}
      tabIndex={tabIndex}
      className={className}
      style={getCellStyle(column, colSpan)}
      onMouseDown={onMouseDown}
      onFocus={onFocus}
    >
      {column.renderSummaryCell?.({ column, row, tabIndex: childTabIndex })}
    </div>
  );
}

export default memo(SummaryCell) as <R, SR>(
  props: SummaryCellProps<R, SR>,
) => React.JSX.Element;
