import type { ObjectSchema } from "@nubase/core";
import { SearchFilterBar } from "../search-controls/SearchFilterBar";
import { SchemaTable } from "./SchemaTable";

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
  /** Debounce delay for the search input in ms. Defaults to 300. */
  searchDebounceMs?: number;
  /** Additional className for the container. */
  className?: string;
};

/**
 * A general-purpose searchable table: a debounced text-search input above a
 * `SchemaTable`. Columns are derived from the schema's table layout.
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
  searchDebounceMs = 300,
  className,
}: SearchableTableProps<TRow>) => {
  return (
    <div className={`flex flex-col h-full w-full space-y-2 ${className ?? ""}`}>
      <SearchFilterBar
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        searchPlaceholder={searchPlaceholder}
        searchDebounceMs={searchDebounceMs}
        showClearFilters={false}
      />
      <SchemaTable
        schema={schema}
        rows={rows}
        loading={loading}
        onRowClick={onRowClick}
      />
    </div>
  );
};
