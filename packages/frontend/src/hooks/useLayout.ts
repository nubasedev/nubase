import type { FormLayout, ObjectSchema, ObjectShape } from "@nubase/core";
import { useMemo } from "react";

/**
 * Returns the form layout attached to the schema via `withFormLayout`. If
 * none is attached, a default layout is built with all fields in a single
 * full-width group.
 */
export function getLayout<TShape extends ObjectShape>(
  schema: ObjectSchema<TShape>,
): FormLayout<TShape> {
  const layout = schema.getFormLayout();
  if (layout) {
    return layout;
  }

  const fieldNames = Object.keys(schema._shape) as (keyof TShape)[];
  return {
    type: "form",
    groups: [
      {
        fields: fieldNames.map((name) => ({
          name,
          fieldWidth: 12, // full width
        })),
      },
    ],
  };
}

/**
 * Hook wrapper around `getLayout` — returns the form layout for rendering.
 */
export function useLayout<TShape extends ObjectShape>(
  schema: ObjectSchema<TShape>,
): FormLayout<TShape> {
  return useMemo(() => getLayout(schema), [schema]);
}
