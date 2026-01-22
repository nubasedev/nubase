import type { FormLayout, ObjectSchema, ObjectShape } from "@nubase/core";
import { useMemo } from "react";

/**
 * Pure function version of useLayout for testing and non-React contexts.
 * Returns a FormLayout for use in form rendering.
 */
export function getLayout<TShape extends ObjectShape>(
  schema: ObjectSchema<TShape>,
  layoutName?: string,
): FormLayout<TShape> {
  // If a layout name is provided and the layout exists, use it
  if (layoutName && schema.hasLayout(layoutName)) {
    const layout = schema.getLayout(layoutName);
    if (layout && layout.type !== "table") {
      return layout;
    }
  }

  // Create a default layout with all fields in a single group
  const fieldNames = Object.keys(schema._shape) as (keyof TShape)[];

  const defaultLayout: FormLayout<TShape> = {
    type: "form",
    groups: [
      {
        fields: fieldNames.map((name) => ({
          name,
          fieldWidth: 12, // Full width for all fields
        })),
      },
    ],
  };

  return defaultLayout;
}

/**
 * Hook to get a form layout for a schema. If a layoutName is provided and exists in the schema,
 * returns that layout. Otherwise, returns a default layout with all fields in a single group
 * with size 12 (full width).
 */
export function useLayout<TShape extends ObjectShape>(
  schema: ObjectSchema<TShape>,
  layoutName?: string,
): FormLayout<TShape> {
  return useMemo(() => getLayout(schema, layoutName), [schema, layoutName]);
}
