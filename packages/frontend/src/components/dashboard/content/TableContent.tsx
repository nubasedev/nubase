import type { TableData } from "@nubase/core";

export interface TableContentProps {
  data: TableData;
  maxRows?: number;
}

/**
 * Renders table content from TableData.
 * This is a presentation component - data fetching is handled by ConnectedWidget.
 */
export function TableContent({ data, maxRows }: TableContentProps) {
  const displayRows = maxRows ? data.rows.slice(0, maxRows) : data.rows;

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b text-left text-muted-foreground">
          {data.columns.map((column) => (
            <th
              key={column.key}
              className="pb-2 font-medium"
              style={{ width: column.width }}
            >
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {displayRows.map((row, rowIndex) => (
          <tr
            key={rowIndex}
            className={rowIndex < displayRows.length - 1 ? "border-b" : ""}
          >
            {data.columns.map((column) => (
              <td key={column.key} className="py-2">
                {String(row[column.key] ?? "")}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
