/**
 * Minimal SQLSTATE → human-readable name lookup. Covers the codes a realistic
 * typed-sql user is likely to hit; unknown codes fall back to the raw number
 * in the diagnostic output.
 *
 * Source: Postgres docs, appendix "A. PostgreSQL Error Codes".
 */
export const SQLSTATE_NAMES: Record<string, string> = {
  "42601": "syntax_error",
  "42602": "invalid_name",
  "42622": "name_too_long",
  "42703": "undefined_column",
  "42704": "undefined_object",
  "42883": "undefined_function",
  "42P01": "undefined_table",
  "42P02": "undefined_parameter",
  "42P03": "duplicate_cursor",
  "42P04": "duplicate_database",
  "42P05": "duplicate_prepared_statement",
  "42P06": "duplicate_schema",
  "42P07": "duplicate_table",
  "42P08": "ambiguous_parameter",
  "42P09": "ambiguous_alias",
  "42P10": "invalid_column_reference",
  "42P11": "invalid_cursor_definition",
  "42P12": "invalid_database_definition",
  "42P13": "invalid_function_definition",
  "42P14": "invalid_prepared_statement_definition",
  "42P15": "invalid_schema_definition",
  "42P16": "invalid_table_definition",
  "42P17": "invalid_object_definition",
  "42P18": "indeterminate_datatype",
  "42P19": "invalid_recursion",
  "42P20": "windowing_error",
  "42P21": "collation_mismatch",
  "42P22": "indeterminate_collation",
  "42701": "duplicate_column",
  "42702": "ambiguous_column",
  "42723": "duplicate_function",
  "42725": "ambiguous_function",
  "42804": "datatype_mismatch",
  "42846": "cannot_coerce",
  "42830": "invalid_foreign_key",
  "42611": "invalid_column_definition",
  "22P02": "invalid_text_representation",
  "22008": "datetime_field_overflow",
  "23502": "not_null_violation",
  "23503": "foreign_key_violation",
  "23505": "unique_violation",
  "23514": "check_violation",
  "53300": "too_many_connections",
  "08006": "connection_failure",
};

export function sqlstateName(code: string | undefined): string | undefined {
  if (!code) return undefined;
  return SQLSTATE_NAMES[code];
}
