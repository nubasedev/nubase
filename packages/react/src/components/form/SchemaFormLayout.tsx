import type { Layout, LayoutField, ObjectShape } from "@nubase/core";
import type React from "react";

export interface SchemaFormLayoutProps<TShape extends ObjectShape = any> {
  layout: Layout<TShape>;
  renderField: (field: LayoutField<TShape>) => React.ReactNode;
}

// Generate the correct col-span class based on size
const getColSpanClass = (size: number) => {
  const colSpanMap: Record<number, string> = {
    1: "col-span-1",
    2: "col-span-2",
    3: "col-span-3",
    4: "col-span-4",
    5: "col-span-5",
    6: "col-span-6",
    7: "col-span-7",
    8: "col-span-8",
    9: "col-span-9",
    10: "col-span-10",
    11: "col-span-11",
    12: "col-span-12",
  };
  return colSpanMap[size] || "col-span-12";
};

// Group fields into rows based on their sizes
const groupFieldsIntoRows = <TShape extends ObjectShape>(
  fields: LayoutField<TShape>[],
): LayoutField<TShape>[][] => {
  const rows: LayoutField<TShape>[][] = [];
  let currentRow: LayoutField<TShape>[] = [];
  let currentRowWidth = 0;

  for (const field of fields) {
    if (field.hidden) continue;

    const fieldSize = field.size || 12;

    // If adding this field would exceed 12, start a new row
    if (currentRowWidth + fieldSize > 12 && currentRow.length > 0) {
      rows.push([...currentRow]);
      currentRow = [field];
      currentRowWidth = fieldSize;
    } else {
      currentRow.push(field);
      currentRowWidth += fieldSize;
    }

    // If this field exactly fills the row, start a new row
    if (currentRowWidth === 12) {
      rows.push([...currentRow]);
      currentRow = [];
      currentRowWidth = 0;
    }
  }

  // Add any remaining fields in the last row
  if (currentRow.length > 0) {
    rows.push([...currentRow]);
  }

  return rows;
};

export const SchemaFormLayout = <TShape extends ObjectShape = any>({
  layout,
  renderField,
}: SchemaFormLayoutProps<TShape>) => {
  return (
    <div className={`layout-${layout.type} ${layout.className || ""}`}>
      {layout.groups.map((group, groupIndex) => (
        <div
          key={groupIndex}
          className={`form-group ${group.className || ""} mb-6`}
        >
          {group.label && (
            <h3 className="text-lg font-medium mb-3 text-onSurface">
              {group.label}
            </h3>
          )}
          {group.description && (
            <p className="text-sm text-onSurfaceVariant mb-3">
              {group.description}
            </p>
          )}
          <div className="space-y-4">
            {groupFieldsIntoRows<TShape>(group.fields).map((row, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-12 gap-4 w-full">
                {row.map((field) => (
                  <div
                    key={String(field.name)}
                    className={`${getColSpanClass(field.size || 12)} ${field.className || ""}`}
                  >
                    {renderField(field)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
