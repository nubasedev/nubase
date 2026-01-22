import type { FormLayout, FormLayoutField, ObjectShape } from "@nubase/core";
import type React from "react";

export interface SchemaFormVerticalLayoutProps<
  TShape extends ObjectShape = any,
> {
  layout: FormLayout<TShape>;
  renderField: (field: FormLayoutField<TShape>) => React.ReactNode;
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
            <h3 className="text-lg font-medium mb-3 text-foreground bg-background py-2 rounded">
              {group.label}
            </h3>
          )}
          {group.description && (
            <p className="text-sm text-muted-foreground mb-3">
              {group.description}
            </p>
          )}
          <div>
            {group.fields
              .filter((field) => !field.hidden)
              .map((field, fieldIndex, visibleFields) => (
                <div key={String(field.name)}>
                  <div className={`w-full ${field.className || ""}`}>
                    {renderField(field)}
                  </div>
                  {fieldIndex < visibleFields.length - 1 && (
                    // This is the separator between fields
                    <div className="border-t border-border my-2" />
                  )}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};
