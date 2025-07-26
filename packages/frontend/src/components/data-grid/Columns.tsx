import type { ActionOrSeparator } from "../../actions/types";
import {
  ActionCellRendererCell,
  ActionCellRendererGroup,
  SelectCellFormatter,
} from "./cellRenderers";
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

export const ACTION_COLUMN_KEY = "rdg-action-column";

/**
 * Creates an action column for a DataGrid that displays a dropdown menu with actions for each row.
 * @param actions - Array of actions or separators to display for each row
 * @param context - Optional context to pass to actions for HTTP calls and other operations
 * @param idField - Optional ID field name for resource actions (defaults to "id")
 * @returns Column configuration for the DataGrid
 */
export function createActionColumn<R>(
  actions: ActionOrSeparator[],
  context?: any,
  idField?: string,
): Column<R, any> {
  return {
    key: ACTION_COLUMN_KEY,
    name: "",
    width: 50,
    minWidth: 50,
    maxWidth: 50,
    resizable: false,
    sortable: false,
    frozen: true,
    renderHeaderCell: () => null,
    renderCell: (props) => (
      <ActionCellRendererCell
        {...props}
        actions={actions}
        context={context}
        idField={idField}
      />
    ),
    renderGroupCell: (props) => (
      <ActionCellRendererGroup {...props} actions={actions} context={context} />
    ),
  };
}
