import type { FormLayout, FormLayoutField, ObjectShape } from "@nubase/core";
import type React from "react";
import { SchemaFormLabelSplitter } from "./SchemaFormLabelSplitter";

export interface SchemaFormVerticalLayoutProps<
  TShape extends ObjectShape = any,
> {
  layout: FormLayout<TShape>;
  renderField: (field: FormLayoutField<TShape>) => React.ReactNode;
  /** When set, only fields whose label or stringified value contains the
   *  term (case-insensitive) are rendered. Groups with no matching fields
   *  are hidden entirely. */
  searchTerm?: string;
  /** Current form values — used to match the search term against field
   *  values (not just labels). Passed from SchemaFormBody. */
  formValues?: Record<string, any>;
  /** Merged metadata keyed by field name — used to read `label` for
   *  search matching when the layout field doesn't have one. */
  metadata?: Record<string, { label?: string } | undefined>;
}

type LayoutItem<TShape extends ObjectShape> =
  | {
      kind: "heading";
      label?: string;
      description?: string;
      className?: string;
    }
  | { kind: "field"; field: FormLayoutField<TShape> };

const fieldMatchesSearch = (
  fieldName: string,
  label: string | undefined,
  value: unknown,
  term: string,
): boolean => {
  const lower = term.toLowerCase();
  if (label?.toLowerCase().includes(lower)) return true;
  if (fieldName.toLowerCase().includes(lower)) return true;
  if (value !== undefined && value !== null) {
    const str = typeof value === "string" ? value : String(value);
    if (str.toLowerCase().includes(lower)) return true;
  }
  return false;
};

export const SchemaFormVerticalLayout = <TShape extends ObjectShape = any>({
  layout,
  renderField,
  searchTerm,
  formValues,
  metadata,
}: SchemaFormVerticalLayoutProps<TShape>) => {
  const trimmedTerm = searchTerm?.trim() ?? "";
  const isSearching = trimmedTerm.length > 0;

  // Flatten groups into a single ordered stream of items. Groups only
  // contribute an optional heading (label/description/className); layout
  // concerns like the label-column splitter and field dividers are
  // form-level, not group-level.
  const items: LayoutItem<TShape>[] = [];
  for (const group of layout.groups) {
    if (group.label || group.description || group.className) {
      items.push({
        kind: "heading",
        label: group.label,
        description: group.description,
        className: group.className,
      });
    }
    for (const field of group.fields) {
      if (field.hidden) continue;
      if (
        isSearching &&
        !fieldMatchesSearch(
          String(field.name),
          metadata?.[String(field.name)]?.label,
          formValues?.[String(field.name)],
          trimmedTerm,
        )
      ) {
        continue;
      }
      items.push({ kind: "field", field });
    }
  }

  return (
    <div className={`relative layout-${layout.type} ${layout.className || ""}`}>
      <SchemaFormLabelSplitter />
      {items.map((item, idx) => {
        if (item.kind === "heading") {
          return (
            <div key={`heading-${idx}`} className={item.className}>
              {item.label && (
                <h3 className="text-lg font-medium mb-3 text-foreground bg-background py-2 rounded">
                  {item.label}
                </h3>
              )}
              {item.description && (
                <p className="text-sm text-muted-foreground mb-3">
                  {item.description}
                </p>
              )}
            </div>
          );
        }
        // Divider only between consecutive field rows; a heading acts as
        // its own visual separator.
        const prev = items[idx - 1];
        const showDivider = prev?.kind === "field";
        return (
          <div key={String(item.field.name)}>
            {showDivider && <div className="border-t border-border my-2" />}
            <div className={`w-full ${item.field.className || ""}`}>
              {renderField(item.field)}
            </div>
          </div>
        );
      })}
    </div>
  );
};
