import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  type OnChangeFn,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { cva } from "class-variance-authority";
import type React from "react";
import { forwardRef } from "react";
import { cn } from "../../utils";

const tableVariants = cva("w-full border-collapse border-spacing-0 text-sm");

const tableContainerVariants = cva(
  "relative overflow-auto border border-outline rounded-lg bg-surface",
  {
    variants: {
      loading: {
        true: "relative",
        false: "",
      },
    },
    defaultVariants: {
      loading: false,
    },
  },
);

export interface TableProps<TData>
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
}

const Table = forwardRef<HTMLTableElement, TableProps<any>>(
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
      ...props
    }: TableProps<TData>,
    ref: React.ForwardedRef<HTMLTableElement>,
  ) => {
    const table = useReactTable({
      data,
      columns,
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
      <div
        className={cn(tableContainerVariants({ loading }), containerClassName)}
      >
        {loading && (
          <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="flex items-center gap-3 bg-surface border border-outline rounded-lg px-4 py-3 shadow-lg">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
              <span className="text-onSurface font-medium">
                {loadingMessage}
              </span>
            </div>
          </div>
        )}

        <table ref={ref} className={cn(tableVariants(), className)} {...props}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-outline">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      "px-4 py-3 text-left font-semibold text-onSurface bg-surfaceVariant",
                      header.column.getCanSort() && enableSorting
                        ? "cursor-pointer select-none hover:bg-surfaceVariant/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                        header.getSize() !== 150 ? header.getSize() : undefined,
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
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-onSurfaceVariant"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, index) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b border-outline/50 hover:bg-surfaceVariant/30 transition-colors",
                    index % 2 === 0 ? "bg-surface" : "bg-surfaceVariant/20",
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-onSurface">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  },
);

Table.displayName = "Table";

export { Table, tableVariants };
