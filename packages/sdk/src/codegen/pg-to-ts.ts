/**
 * Maps PostgreSQL data types to TypeScript types.
 */
export function pgTypeToTs(udtName: string, dataType: string): string {
  // Check for array types first (PG uses underscore prefix for array udt names)
  if (udtName.startsWith("_")) {
    const elementType = pgTypeToTs(udtName.slice(1), "ARRAY_ELEMENT");
    return `${elementType}[]`;
  }

  switch (udtName) {
    // Integers
    case "int2":
    case "int4":
    case "int8":
    case "float4":
    case "float8":
    case "numeric":
    case "serial":
    case "bigserial":
    case "smallserial":
      return "number";

    // Strings
    case "varchar":
    case "text":
    case "char":
    case "bpchar":
    case "name":
    case "citext":
    case "uuid":
      return "string";

    // Boolean
    case "bool":
      return "boolean";

    // Date/time → ISO strings
    case "timestamp":
    case "timestamptz":
    case "date":
    case "time":
    case "timetz":
    case "interval":
      return "string";

    // JSON
    case "json":
    case "jsonb":
      return "unknown";

    // Binary
    case "bytea":
      return "string";

    default:
      // For user-defined types (enums), the caller should check the enum list
      // and provide a union type. Fall through to unknown.
      if (dataType === "USER-DEFINED") {
        return "USER_DEFINED";
      }
      return "unknown";
  }
}

/**
 * Convert a snake_case SQL name to PascalCase TypeScript name.
 */
export function toPascalCase(snakeCase: string): string {
  return snakeCase
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");
}

/**
 * Convert a snake_case SQL name to camelCase TypeScript name.
 */
export function toCamelCase(snakeCase: string): string {
  const pascal = toPascalCase(snakeCase);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Singularize a simple plural table name (e.g. "tickets" → "ticket").
 * This is a simple heuristic, not a full NLP singularizer.
 */
export function singularize(name: string): string {
  if (name.endsWith("ies")) {
    return `${name.slice(0, -3)}y`;
  }
  if (
    name.endsWith("ses") ||
    name.endsWith("xes") ||
    name.endsWith("zes") ||
    name.endsWith("ches") ||
    name.endsWith("shes")
  ) {
    return name.slice(0, -2);
  }
  if (name.endsWith("s") && !name.endsWith("ss")) {
    return name.slice(0, -1);
  }
  return name;
}
