import { SquareArrowOutUpRight } from "lucide-react";
import { SelectCellFormatter } from "./cellRenderers";
import {
  useHeaderRowSelection,
  useRowSelection,
} from "./hooks/useRowSelection";
import type {
  Column,
  RenderCellProps,
  RenderGroupCellProps,
  RenderHeaderCellProps,
} from "./types";

export const SELECT_COLUMN_KEY = "rdg-select-column";

function HeaderRenderer(props: RenderHeaderCellProps<unknown>) {
  const { isIndeterminate, isRowSelected, onRowSelectionChange } =
    useHeaderRowSelection();

  return (
    <SelectCellFormatter
      aria-label="Select All"
      tabIndex={props.tabIndex}
      indeterminate={isIndeterminate}
      value={isRowSelected}
      onChange={(checked: boolean) => {
        onRowSelectionChange({ checked: isIndeterminate ? false : checked });
      }}
    />
  );
}

function SelectFormatter(props: RenderCellProps<unknown>) {
  const { isRowSelectionDisabled, isRowSelected, onRowSelectionChange } =
    useRowSelection();

  return (
    <SelectCellFormatter
      aria-label="Select"
      tabIndex={props.tabIndex}
      disabled={isRowSelectionDisabled}
      value={isRowSelected}
      onChange={(checked: boolean, isShiftClick: boolean) => {
        onRowSelectionChange({ row: props.row, checked, isShiftClick });
      }}
    />
  );
}

function SelectGroupFormatter(props: RenderGroupCellProps<unknown>) {
  const { isRowSelected, onRowSelectionChange } = useRowSelection();

  return (
    <SelectCellFormatter
      aria-label="Select Group"
      tabIndex={props.tabIndex}
      value={isRowSelected}
      onChange={(checked: boolean) => {
        onRowSelectionChange({ row: props.row, checked, isShiftClick: false });
      }}
    />
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SelectColumn: Column<any, any> = {
  key: SELECT_COLUMN_KEY,
  name: "",
  width: 35,
  minWidth: 35,
  maxWidth: 35,
  resizable: false,
  sortable: false,
  frozen: true,
  renderHeaderCell(props) {
    return <HeaderRenderer {...props} />;
  },
  renderCell(props) {
    return <SelectFormatter {...props} />;
  },
  renderGroupCell(props) {
    return <SelectGroupFormatter {...props} />;
  },
};

export const NAVIGATE_COLUMN_KEY = "rdg-navigate-column";

/**
 * Creates a navigate column for a DataGrid that displays an icon button to navigate to the entity's view screen.
 * @param onNavigate - Callback invoked with the row when the navigate button is clicked
 * @param idField - The field name used as the row identifier (defaults to "id")
 * @returns Column configuration for the DataGrid
 */
export function createNavigateColumn<R>(
  onNavigate: (row: R) => void,
  idField = "id",
): Column<R, any> {
  return {
    key: NAVIGATE_COLUMN_KEY,
    name: "",
    width: 40,
    minWidth: 40,
    maxWidth: 40,
    resizable: false,
    sortable: false,
    frozen: true,
    renderHeaderCell: () => null,
    renderCell: ({ row }) => {
      const id = (row as any)[idField];
      if (id == null) return null;

      return (
        <button
          type="button"
          className="flex items-center justify-center w-full h-full text-onSurfaceVariant hover:text-primary cursor-pointer"
          onClick={() => onNavigate(row)}
          aria-label="View details"
        >
          <SquareArrowOutUpRight size={16} />
        </button>
      );
    },
  };
}
