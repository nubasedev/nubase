import type { Layout, LayoutField, ObjectShape } from "@nubase/core";
import type React from "react";

export interface SchemaFormVerticalLayoutProps<
  TShape extends ObjectShape = any,
> {
  layout: Layout<TShape>;
  renderField: (field: LayoutField<TShape>) => React.ReactNode;
}

export const SchemaFormVerticalLayout = <TShape extends ObjectShape = any>({
  layout,
  renderField,
}: SchemaFormVerticalLayoutProps<TShape>) => {
  return (
    <div className={`layout-${layout.type} ${layout.className || ""}`}>
      {layout.groups.map((group, groupIndex) => (
        <div key={groupIndex} className={`form-group ${group.className || ""}`}>
          {group.label && (
            <h3 className="text-lg font-medium mb-3 text-onSurface bg-surface px-3 py-2 rounded">
              {group.label}
            </h3>
          )}
          {group.description && (
            <p className="text-sm text-onSurfaceVariant mb-3 px-3">
              {group.description}
            </p>
          )}
          <div className="space-y-0">
            {group.fields
              .filter((field) => !field.hidden)
              .map((field, fieldIndex, visibleFields) => (
                <div key={String(field.name)}>
                  <div className={`w-full ${field.className || ""}`}>
                    {renderField(field)}
                  </div>
                  {fieldIndex < visibleFields.length - 1 && (
                    <div className="border-t border-outlineVariant my-4" />
                  )}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};
