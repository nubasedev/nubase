import { type VariantProps, cva } from "class-variance-authority";
import type React from "react";
import { forwardRef } from "react";
import { cn } from "../../utils";
import { Button } from "../buttons/Button/Button";

const paginationVariants = cva(
  "flex items-center justify-between gap-4 p-4 bg-surface border-t border-outline text-sm",
);

export interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  showInfo?: boolean;
}

const Pagination = forwardRef<HTMLDivElement, PaginationProps>(
  (
    {
      className,
      currentPage,
      totalPages,
      pageSize,
      totalItems,
      onPageChange,
      onPageSizeChange,
      pageSizeOptions = [10, 25, 50, 100],
      showPageSizeSelector = true,
      showInfo = true,
      ...props
    },
    ref,
  ) => {
    const startItem = Math.min((currentPage - 1) * pageSize + 1, totalItems);
    const endItem = Math.min(currentPage * pageSize, totalItems);

    const getVisiblePages = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (
        let i = Math.max(2, currentPage - delta);
        i <= Math.min(totalPages - 1, currentPage + delta);
        i++
      ) {
        range.push(i);
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, "...");
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push("...", totalPages);
      } else if (totalPages > 1) {
        rangeWithDots.push(totalPages);
      }

      return rangeWithDots;
    };

    return (
      <div ref={ref} className={cn(paginationVariants(), className)} {...props}>
        <div className="flex items-center gap-4">
          {showInfo && (
            <span className="text-onSurfaceVariant">
              Showing {startItem}-{endItem} of {totalItems} items
            </span>
          )}

          {showPageSizeSelector && onPageSizeChange && (
            <div className="flex items-center gap-2">
              <span className="text-onSurfaceVariant">Items per page:</span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="bg-surface border border-outline rounded px-2 py-1 text-onSurface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
              >
                {pageSizeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="secondary"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            aria-label="Go to first page"
          >
            ««
          </Button>

          <Button
            variant="secondary"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Go to previous page"
          >
            ‹
          </Button>

          <div className="flex items-center gap-1 mx-2">
            {getVisiblePages().map((page, index) => (
              <div key={index}>
                {page === "..." ? (
                  <span className="px-2 py-1 text-onSurfaceVariant">...</span>
                ) : (
                  <Button
                    variant={currentPage === page ? "primary" : "secondary"}
                    onClick={() => onPageChange(page as number)}
                    className="min-w-[32px]"
                    aria-label={`Go to page ${page}`}
                    aria-current={currentPage === page ? "page" : undefined}
                  >
                    {page}
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button
            variant="secondary"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Go to next page"
          >
            ›
          </Button>

          <Button
            variant="secondary"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            aria-label="Go to last page"
          >
            »»
          </Button>
        </div>
      </div>
    );
  },
);

Pagination.displayName = "Pagination";

export { Pagination, paginationVariants };
