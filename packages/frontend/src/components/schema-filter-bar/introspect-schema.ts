import type { BaseSchema, ObjectSchema, SchemaMetadata } from "@nubase/core";
import { OptionalSchema, SEARCH_FIELD_NAME } from "@nubase/core";
import type { FilterFieldDescriptor, SchemaFilterConfig } from "./types";

/**
 * Converts a camelCase field name to Title Case.
 * @example formatFieldName("assigneeId") => "Assignee Id"
 */
function formatFieldName(name: string): string {
  return name
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

/**
 * Unwraps an OptionalSchema to get the base schema.
 * Returns the schema and whether it was wrapped.
 */
function unwrapSchema(schema: BaseSchema<any>): {
  baseSchema: BaseSchema<any>;
  isOptional: boolean;
} {
  if (schema instanceof OptionalSchema) {
    return { baseSchema: schema.unwrap(), isOptional: true };
  }
  return { baseSchema: schema, isOptional: false };
}

/**
 * Determines the filter type based on schema type and metadata.
 */
function determineFilterType(
  schemaType: string,
  metadata: SchemaMetadata,
): FilterFieldDescriptor["filterType"] | null {
  // If it has a lookupResource, it's a lookup filter
  if (metadata.renderer === "lookup" && metadata.lookupResource) {
    return "lookup";
  }

  // Map schema types to filter types
  switch (schemaType) {
    case "string":
      return "text";
    case "number":
      return "text"; // Numbers without lookup use text filter
    case "boolean":
      return "boolean";
    default:
      // Skip unsupported types (object, array, etc.)
      return null;
  }
}

/**
 * Introspects an ObjectSchema and returns filter descriptors for each field.
 *
 * @param schema The ObjectSchema to introspect (typically endpoint.requestParams)
 * @param config Optional configuration for filtering and customization
 * @returns Array of filter field descriptors
 *
 * @example
 * ```typescript
 * const filterSchema = apiEndpoints.getTickets.requestParams;
 * const descriptors = introspectSchemaForFilters(filterSchema, {
 *   excludeFields: ["createdAt"],
 *   labels: { assigneeId: "Assigned To" }
 * });
 * ```
 */
export function introspectSchemaForFilters<TSchema extends ObjectSchema<any>>(
  schema: TSchema,
  config?: SchemaFilterConfig,
): FilterFieldDescriptor[] {
  const descriptors: FilterFieldDescriptor[] = [];
  const shape = schema._shape;

  for (const [fieldName, fieldSchema] of Object.entries(shape)) {
    // Always skip the search field - it's handled by SearchFilterBar
    if (fieldName === SEARCH_FIELD_NAME) {
      continue;
    }

    // Skip excluded fields
    if (config?.excludeFields?.includes(fieldName)) {
      continue;
    }

    const field = fieldSchema as BaseSchema<any>;

    // Get metadata from either the optional wrapper or the base schema
    // Metadata can be on the OptionalSchema (when using .optional().withMeta())
    // or on the base schema (when using .withMeta().optional())
    const optionalMetadata: SchemaMetadata = field._meta || {};

    // Unwrap optional schema to get the base schema
    const { baseSchema } = unwrapSchema(field);

    // Get metadata from the base schema as fallback
    const baseMetadata: SchemaMetadata = baseSchema._meta || {};

    // Merge metadata, preferring optional wrapper metadata (most common pattern)
    const metadata: SchemaMetadata = { ...baseMetadata, ...optionalMetadata };

    // Determine the filter type
    const filterType = determineFilterType(baseSchema.type, metadata);

    // Skip fields that don't map to a filter type
    if (filterType === null) {
      continue;
    }

    // Build the descriptor
    const descriptor: FilterFieldDescriptor = {
      name: fieldName,
      label:
        config?.labels?.[fieldName] ||
        metadata.label ||
        formatFieldName(fieldName),
      filterType,
      schemaType: baseSchema.type,
      metadata,
    };

    // Add lookupResource for lookup filters
    if (filterType === "lookup" && metadata.lookupResource) {
      descriptor.lookupResource = metadata.lookupResource;
    }

    descriptors.push(descriptor);
  }

  return descriptors;
}
