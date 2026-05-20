import {
  type BaseSchema,
  type ObjectSchema,
  OptionalSchema,
} from "@nubase/core";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator } from "../activity-indicator";
import { DataGrid } from "../data-grid/DataGrid";
import type { Column } from "../data-grid/types";

const LOADING_OVERLAY_DELAY_MS = 150;

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

export type SchemaTableProps<TRow extends Record<string, any>> = {
  /** Object schema describing the row shape. Used to derive columns from its `default` (or `table`) layout. */
  schema: ObjectSchema<any>;
  /** Rows to display. */
  rows: readonly TRow[];
  /** Whether the table is loading data. Shown as an overlay over the grid. */
  loading?: boolean;
  /** Called when a row is clicked. */
  onRowClick?: (row: TRow) => void;
  /** Message shown when there are no rows and not loading. Defaults to "No items found". */
  emptyMessage?: string;
  /** Additional className for the container. */
  className?: string;
};

/**
 * Presentational table that renders rows according to the schema's table
 * layout. No search input — callers compose their own filter UI above it.
 *
 * Loading overlay only appears after a short delay (`150 ms`) so quick
 * fetches don't flash a spinner.
 */
export const SchemaTable = <TRow extends Record<string, any>>({
  schema,
  rows,
  loading = false,
  onRowClick,
  emptyMessage = "No items found",
  className,
}: SchemaTableProps<TRow>) => {
  const tableLayout = schema.getTableLayout();
  const idField = String(schema.getIdField() || "id");

  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  useEffect(() => {
    if (!loading) {
      setShowLoadingOverlay(false);
      return;
    }
    const timer = setTimeout(() => {
      setShowLoadingOverlay(true);
    }, LOADING_OVERLAY_DELAY_MS);
    return () => clearTimeout(timer);
  }, [loading]);

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
    <div className={`flex-1 relative min-h-[200px] ${className ?? ""}`}>
      {showLoadingOverlay && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10 pointer-events-none">
          <ActivityIndicator size="md" aria-label="Loading..." />
        </div>
      )}
      {!loading && rows.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground z-10">
          {emptyMessage}
        </div>
      )}
      <DataGrid
        columns={columns}
        rows={rows as TRow[]}
        className="h-full w-full"
        style={{ height: "100%" }}
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
  );
};
