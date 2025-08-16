import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  type OnChangeFn,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";

import { cn } from "../../lib/utils";

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-hidden rounded-md border"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
        className,
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  );
}

// Enhanced Table component with TanStack integration
export interface EnhancedTableProps<TData>
  extends React.TableHTMLAttributes<HTMLTableElement> {
  data: TData[];
  columns: ColumnDef<TData>[];
  loading?: boolean;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  enableSorting?: boolean;
  emptyMessage?: string;
  loadingMessage?: string;
  containerClassName?: string;
  actionsColumn?: ColumnDef<TData>; // Optional actions column
}

const EnhancedTable = React.forwardRef<
  HTMLTableElement,
  EnhancedTableProps<any>
>(
  <TData,>(
    {
      className,
      containerClassName,
      data,
      columns,
      loading = false,
      sorting = [],
      onSortingChange,
      enableSorting = true,
      emptyMessage = "No data available",
      loadingMessage = "Loading...",
      actionsColumn,
      ...props
    }: EnhancedTableProps<TData>,
    ref: React.ForwardedRef<HTMLTableElement>,
  ) => {
    // Combine regular columns with optional actions column
    const allColumns = React.useMemo(() => {
      const cols = [...columns];
      if (actionsColumn) {
        cols.push(actionsColumn);
      }
      return cols;
    }, [columns, actionsColumn]);

    const table = useReactTable({
      data,
      columns: allColumns,
      getCoreRowModel: getCoreRowModel(),
      manualSorting: true,
      enableSorting,
      state: {
        sorting,
      },
      onSortingChange,
    });

    const getSortIcon = (column: any) => {
      const sortDirection = column.getIsSorted();
      if (sortDirection === "asc") {
        return (
          <svg
            className="w-4 h-4 ml-1 inline"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-label="Sorted ascending"
          >
            <title>Sorted ascending</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
        );
      }
      if (sortDirection === "desc") {
        return (
          <svg
            className="w-4 h-4 ml-1 inline"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-label="Sorted descending"
          >
            <title>Sorted descending</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        );
      }
      return (
        <svg
          className="w-4 h-4 ml-1 inline opacity-30"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-label="Sortable"
        >
          <title>Sortable</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 9l4-4 4 4m0 6l-4 4-4-4"
          />
        </svg>
      );
    };

    return (
      <div className={cn("relative w-full", containerClassName)}>
        {loading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-md">
            <div className="flex items-center gap-3 bg-background border border-border rounded-lg px-4 py-3 shadow-lg">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
              <span className="text-foreground font-medium">
                {loadingMessage}
              </span>
            </div>
          </div>
        )}

        <div className="relative w-full overflow-hidden rounded-md border">
          <table
            ref={ref}
            className={cn("w-full caption-bottom text-sm", className)}
            {...props}
          >
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        header.column.getCanSort() && enableSorting
                          ? "cursor-pointer select-none hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                          : "",
                      )}
                      tabIndex={
                        header.column.getCanSort() && enableSorting
                          ? 0
                          : undefined
                      }
                      role={
                        header.column.getCanSort() && enableSorting
                          ? "button"
                          : undefined
                      }
                      onClick={
                        header.column.getCanSort() && enableSorting
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                      onKeyDown={
                        header.column.getCanSort() && enableSorting
                          ? (e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                header.column.getToggleSortingHandler()?.(e);
                              }
                            }
                          : undefined
                      }
                      style={{
                        width:
                          header.getSize() !== 150
                            ? header.getSize()
                            : undefined,
                      }}
                    >
                      <div className="flex items-center">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                        {header.column.getCanSort() &&
                          enableSorting &&
                          getSortIcon(header.column)}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center text-muted-foreground h-24"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </table>
        </div>
      </div>
    );
  },
);

EnhancedTable.displayName = "EnhancedTable";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  EnhancedTable,
};
