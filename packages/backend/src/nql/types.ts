/**
 * Source position tracking. `line` and `column` are 1-based to match
 * how most editors report positions. `offset` is a 0-based character
 * offset into the original source string.
 */
export interface SourceSpan {
  line: number;
  column: number;
  offset: number;
  length: number;
}

export type TokenKind =
  | "Identifier"
  | "String"
  | "Number"
  | "True"
  | "False"
  | "Null"
  | "LParen"
  | "RParen"
  | "And"
  | "Or"
  | "Not"
  | "Is"
  | "In"
  | "Comma"
  | "Eq"
  | "NotEq"
  | "Lt"
  | "LtEq"
  | "Gt"
  | "GtEq"
  | "Contains"
  | "StartsWith"
  | "EndsWith"
  | "Eof";

export interface Token {
  kind: TokenKind;
  span: SourceSpan;
  /** Raw source text of the token (e.g. `"Title"`, `"\"foo\""`, `"-5"`). */
  text: string;
  /** Decoded string value (escapes applied). Present only for String tokens. */
  stringValue?: string;
  /** Decoded numeric value. Present only for Number tokens. */
  numberValue?: number;
}

export type NqlErrorCode = "TOKENIZE" | "PARSE" | "VALIDATE";

export interface NqlError {
  code: NqlErrorCode;
  message: string;
  line: number;
  column: number;
  length?: number;
}

export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

export type ComparisonOp =
  | "="
  | "!="
  | "<"
  | "<="
  | ">"
  | ">="
  | "CONTAINS"
  | "STARTS_WITH"
  | "ENDS_WITH";

export interface IdentifierRef {
  raw: string;
  span: SourceSpan;
}

export interface StringLit {
  kind: "string";
  value: string;
  span: SourceSpan;
}

export interface NumberLit {
  kind: "number";
  value: number;
  span: SourceSpan;
}

export interface BoolLit {
  kind: "boolean";
  value: boolean;
  span: SourceSpan;
}

export interface NullLit {
  kind: "null";
  span: SourceSpan;
}

export type Literal = StringLit | NumberLit | BoolLit | NullLit;

export interface ComparisonNode {
  type: "comparison";
  field: IdentifierRef;
  op: ComparisonOp;
  value: Literal;
  span: SourceSpan;
}

export interface NullCheckNode {
  type: "nullCheck";
  field: IdentifierRef;
  negated: boolean;
  span: SourceSpan;
}

export interface InNode {
  type: "in";
  field: IdentifierRef;
  negated: boolean;
  values: Literal[];
  span: SourceSpan;
}

export interface LogicalNode {
  type: "logical";
  op: "AND" | "OR" | "NOT";
  children: ParsedNode[];
  span: SourceSpan;
}

export type ParsedNode = ComparisonNode | NullCheckNode | InNode | LogicalNode;

// ----- Validated AST -----
// Produced by the validator once identifiers have been resolved against a
// schema. Fields are canonicalized, base types are resolved, and
// operator/literal compatibility is guaranteed by construction.

export type ValidFieldType = "string" | "number" | "boolean";

export interface ValidFieldRef {
  /** Canonical name from the schema (not the raw source text). */
  name: string;
  baseType: ValidFieldType;
  /** True if the schema wraps this field in OptionalSchema. */
  optional: boolean;
  span: SourceSpan;
}

export interface ValidComparisonNode {
  type: "comparison";
  field: ValidFieldRef;
  op: ComparisonOp;
  value: Literal;
  span: SourceSpan;
}

export interface ValidNullCheckNode {
  type: "nullCheck";
  field: ValidFieldRef;
  negated: boolean;
  span: SourceSpan;
}

export interface ValidInNode {
  type: "in";
  field: ValidFieldRef;
  negated: boolean;
  values: Literal[];
  span: SourceSpan;
}

export interface ValidLogicalNode {
  type: "logical";
  op: "AND" | "OR" | "NOT";
  children: ValidNode[];
  span: SourceSpan;
}

export type ValidNode =
  | ValidComparisonNode
  | ValidNullCheckNode
  | ValidInNode
  | ValidLogicalNode;
