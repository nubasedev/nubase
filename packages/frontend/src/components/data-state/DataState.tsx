import type { FC, ReactNode } from "react";
import { ActivityIndicator } from "../activity-indicator/ActivityIndicator";

export type DataStateProps = {
  /** Whether data is currently loading */
  isLoading?: boolean;
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
 * @example
 * ```tsx
 * <DataState
 *   isLoading={isLoading}
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
  error = null,
  isEmpty = false,
  emptyMessage = "No items found",
  loadingLabel = "Loading...",
  errorMessage = "Error loading data",
  children,
}) => {
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

  return <>{children}</>;
};
