import type { FC, ReactNode } from "react";
import { ActivityIndicator } from "../activity-indicator/ActivityIndicator";

export type DataStateProps = {
  /** Whether data is currently loading (initial load with no cached data) */
  isLoading?: boolean;
  /** Whether data is being fetched (refetch with existing data visible) */
  isFetching?: boolean;
  /** Error that occurred during data fetching */
  error?: Error | null;
  /** Whether the data set is empty (after successful load) */
  isEmpty?: boolean;
  /** Message to display when data is empty */
  emptyMessage?: string;
  /** Aria label for the loading indicator */
  loadingLabel?: string;
  /** Message to display when there's an error */
  errorMessage?: string;
  /** Content to render when data is successfully loaded */
  children: ReactNode;
};

/**
 * A component that handles common data fetching states: loading, error, and empty.
 * Renders children only when data is successfully loaded and not empty.
 *
 * Supports two loading modes:
 * - `isLoading`: Initial load - shows spinner, hides children (use when no cached data)
 * - `isFetching`: Refetch - shows subtle overlay on top of children (use during refetches)
 *
 * @example
 * ```tsx
 * <DataState
 *   isLoading={isLoading}
 *   isFetching={isFetching && !isLoading}
 *   error={error}
 *   isEmpty={data.length === 0}
 *   emptyMessage="No items found"
 *   loadingLabel="Loading search results..."
 * >
 *   <DataGrid data={data} />
 * </DataState>
 * ```
 */
export const DataState: FC<DataStateProps> = ({
  isLoading = false,
  isFetching = false,
  error = null,
  isEmpty = false,
  emptyMessage = "No items found",
  loadingLabel = "Loading...",
  errorMessage = "Error loading data",
  children,
}) => {
  // Initial load: show full spinner, hide children
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ActivityIndicator size="lg" aria-label={loadingLabel} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-destructive">
        {errorMessage}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex justify-center items-center h-64 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  // Refetch: show children with loading overlay
  return (
    <div className="relative h-full">
      {children}
      {isFetching && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center pointer-events-none">
          <ActivityIndicator size="md" aria-label={loadingLabel} />
        </div>
      )}
    </div>
  );
};
