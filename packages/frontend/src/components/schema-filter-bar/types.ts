import type { ObjectSchema, SchemaMetadata } from "@nubase/core";

/**
 * Describes how a schema field maps to a filter control.
 */
export type FilterFieldDescriptor = {
  /** Field name from the schema */
  name: string;

  /** Display label (from metadata or derived from name) */
  label: string;

  /** The filter type to render */
  filterType: "text" | "lookup" | "boolean";

  /** For lookup filters: the resource ID to search */
  lookupResource?: string;

  /** The underlying schema type (string, number, boolean) */
  schemaType: string;

  /** Original field metadata */
  metadata: SchemaMetadata;
};

/**
 * Filter state derived from schema - a partial object matching the schema shape.
 * For lookup fields with multi-select, the value is an array.
 */
export type SchemaFilterState<TSchema extends ObjectSchema<any>> = {
  [K in keyof TSchema["_shape"]]?: TSchema["_shape"][K]["_outputType"] extends
    | number
    | string
    ?
        | TSchema["_shape"][K]["_outputType"]
        | TSchema["_shape"][K]["_outputType"][]
    : TSchema["_shape"][K]["_outputType"];
};

/**
 * Configuration options for schema filter introspection.
 */
export type SchemaFilterConfig = {
  /** Fields to exclude from filters */
  excludeFields?: string[];

  /** Custom labels for fields (overrides metadata.label) */
  labels?: Record<string, string>;
};
