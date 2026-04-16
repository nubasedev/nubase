import {
  type BaseSchema,
  type ObjectSchema,
  OptionalSchema,
} from "@nubase/core";
import { useMemo } from "react";
import { ActivityIndicator } from "../activity-indicator";
import { DataGrid } from "../data-grid/DataGrid";
import type { Column } from "../data-grid/types";
import { SearchFilterBar } from "../search-controls/SearchFilterBar";

const DEFAULT_COLUMN_WIDTHS: Record<string, number> = {
  number: 100,
  boolean: 80,
  string: 200,
  object: 250,
  array: 200,
  optional: 200,
};

const getDefaultColumnWidth = (fieldSchema: BaseSchema<any>): number => {
  if (fieldSchema instanceof OptionalSchema) {
    return getDefaultColumnWidth(fieldSchema.unwrap());
  }
  return DEFAULT_COLUMN_WIDTHS[fieldSchema.type] || 150;
};

export type SearchableTableProps<TRow extends Record<string, any>> = {
  /** Object schema describing the row shape. Used to derive columns from its `default` (or `table`) layout. */
  schema: ObjectSchema<any>;
  /** Rows to display. */
  rows: readonly TRow[];
  /** Current value of the search input. */
  searchValue: string;
  /** Called when the (debounced) search input changes. */
  onSearchChange: (value: string) => void;
  /** Whether the table is loading data. Shown as an overlay over the grid. */
  loading?: boolean;
  /** Called when a row is clicked. */
  onRowClick?: (row: TRow) => void;
  /** Placeholder for the search input. */
  searchPlaceholder?: string;
  /** Debounce delay for the search input in ms. Defaults to 200. */
  searchDebounceMs?: number;
  /** Additional className for the container. */
  className?: string;
};

/**
 * A general-purpose searchable table: a debounced text-search input above a
 * `DataGrid`. Columns are derived from the schema's table layout.
 *
 * Search is controlled by the parent — `onSearchChange` is called with the
 * (debounced) query string and the parent decides how to fetch / filter rows.
 */
export const SearchableTable = <TRow extends Record<string, any>>({
  schema,
  rows,
  searchValue,
  onSearchChange,
  loading = false,
  onRowClick,
  searchPlaceholder = "Search...",
  searchDebounceMs = 200,
  className,
}: SearchableTableProps<TRow>) => {
  const tableLayout = schema.getTableLayout();
  const idField = String(schema.getIdField() || "id");

  const columns: Column<TRow>[] = useMemo(() => {
    const cols: Column<TRow>[] = [];

    if (tableLayout) {
      tableLayout.fields
        .filter((field) => !field.hidden)
        .forEach((field) => {
          const fieldName = field.name as string;
          let width = field.columnWidthPx;
          if (width === undefined) {
            const fieldSchema = schema._shape[fieldName];
            width = fieldSchema ? getDefaultColumnWidth(fieldSchema) : 150;
          }
          cols.push({
            name: field.label || fieldName,
            key: fieldName,
            width,
            resizable: true,
            frozen: field.pinned === true,
            renderCell: ({ row }) => row[fieldName]?.toString() || "",
          });
        });
    } else if (rows.length > 0 && rows[0]) {
      // Fallback: derive columns from the first row's keys
      Object.keys(rows[0]).forEach((key) => {
        cols.push({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          key,
          width: 150,
          resizable: true,
          renderCell: ({ row }) => row[key]?.toString() || "",
        });
      });
    }

    return cols;
  }, [tableLayout, schema, rows]);

  return (
    <div className={`flex flex-col h-full w-full space-y-2 ${className ?? ""}`}>
      <SearchFilterBar
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        searchPlaceholder={searchPlaceholder}
        searchDebounceMs={searchDebounceMs}
        showClearFilters={false}
      />
      <div className="flex-1 relative min-h-[200px]">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10 pointer-events-none">
            <ActivityIndicator size="md" aria-label="Loading..." />
          </div>
        )}
        {!loading && rows.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground z-10">
            No items found
          </div>
        )}
        <DataGrid
          columns={columns}
          rows={rows as TRow[]}
          className="h-full w-full"
          rowKeyGetter={(row) => row[idField] ?? row}
          onCellClick={
            onRowClick
              ? (args) => {
                  onRowClick(args.row);
                }
              : undefined
          }
        />
      </div>
    </div>
  );
};
