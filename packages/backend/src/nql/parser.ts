import type {
  ComparisonNode,
  ComparisonOp,
  InNode,
  Literal,
  LogicalNode,
  NqlError,
  NullCheckNode,
  ParsedNode,
  Result,
  SourceSpan,
  Token,
  TokenKind,
} from "./types";

const COMPARISON_OP_BY_KIND: Partial<Record<TokenKind, ComparisonOp>> = {
  Eq: "=",
  NotEq: "!=",
  Lt: "<",
  LtEq: "<=",
  Gt: ">",
  GtEq: ">=",
  Contains: "CONTAINS",
  StartsWith: "STARTS_WITH",
  EndsWith: "ENDS_WITH",
};

export function parse(tokens: Token[]): Result<ParsedNode, NqlError> {
  const parser = new Parser(tokens);
  try {
    const node = parser.parseExpression();
    parser.expect("Eof", "Expected end of input");
    return { ok: true, value: node };
  } catch (e) {
    if (e instanceof ParseError) {
      return {
        ok: false,
        error: {
          code: "PARSE",
          message: e.message,
          line: e.span.line,
          column: e.span.column,
          length: e.span.length,
        },
      };
    }
    throw e;
  }
}

class ParseError extends Error {
  constructor(
    message: string,
    public readonly span: SourceSpan,
  ) {
    super(message);
    this.name = "ParseError";
  }
}

class Parser {
  private pos = 0;

  constructor(private readonly tokens: Token[]) {}

  parseExpression(): ParsedNode {
    return this.parseOr();
  }

  // or_expr := and_expr ( OR and_expr )*
  private parseOr(): ParsedNode {
    let left = this.parseAnd();
    while (this.peek().kind === "Or") {
      this.advance();
      const right = this.parseAnd();
      left = makeLogical("OR", [left, right]);
    }
    return left;
  }

  // and_expr := not_expr ( AND not_expr )*
  private parseAnd(): ParsedNode {
    let left = this.parseNot();
    while (this.peek().kind === "And") {
      this.advance();
      const right = this.parseNot();
      left = makeLogical("AND", [left, right]);
    }
    return left;
  }

  // not_expr := NOT not_expr | primary
  private parseNot(): ParsedNode {
    if (this.peek().kind === "Not") {
      const notTok = this.advance();
      const inner = this.parseNot();
      return {
        type: "logical",
        op: "NOT",
        children: [inner],
        span: mergeSpans(notTok.span, inner.span),
      };
    }
    return this.parsePrimary();
  }

  // primary := "(" expression ")" | comparison
  private parsePrimary(): ParsedNode {
    const tok = this.peek();
    if (tok.kind === "LParen") {
      this.advance();
      const inner = this.parseExpression();
      this.expect("RParen", "Expected closing ')'");
      return inner;
    }
    return this.parseComparison();
  }

  // comparison := identifier comparison_op literal
  //             | identifier (IN | NOT IN) "(" literal ("," literal)* ")"
  //             | identifier IS [NOT] NULL
  private parseComparison(): ComparisonNode | NullCheckNode | InNode {
    const identTok = this.peek();
    if (identTok.kind !== "Identifier") {
      throw new ParseError(
        `Expected field name, got ${describeToken(identTok)}`,
        identTok.span,
      );
    }
    this.advance();
    const field = { raw: identTok.text, span: identTok.span };

    const opTok = this.peek();

    // IS [NOT] NULL
    if (opTok.kind === "Is") {
      this.advance();
      let negated = false;
      if (this.peek().kind === "Not") {
        this.advance();
        negated = true;
      }
      const nullTok = this.peek();
      if (nullTok.kind !== "Null") {
        throw new ParseError(
          `Expected NULL after ${negated ? "IS NOT" : "IS"}, got ${describeToken(nullTok)}`,
          nullTok.span,
        );
      }
      this.advance();
      return {
        type: "nullCheck",
        field,
        negated,
        span: mergeSpans(identTok.span, nullTok.span),
      };
    }

    // IN (...) or NOT IN (...)
    if (opTok.kind === "In") {
      this.advance();
      const { values, endSpan } = this.parseLiteralList();
      return {
        type: "in",
        field,
        negated: false,
        values,
        span: mergeSpans(identTok.span, endSpan),
      };
    }
    if (opTok.kind === "Not") {
      this.advance();
      const inTok = this.peek();
      if (inTok.kind !== "In") {
        throw new ParseError(
          `Expected IN after NOT, got ${describeToken(inTok)}`,
          inTok.span,
        );
      }
      this.advance();
      const { values, endSpan } = this.parseLiteralList();
      return {
        type: "in",
        field,
        negated: true,
        values,
        span: mergeSpans(identTok.span, endSpan),
      };
    }

    const op = COMPARISON_OP_BY_KIND[opTok.kind];
    if (!op) {
      throw new ParseError(
        `Expected comparison operator after '${identTok.text}', got ${describeToken(opTok)}`,
        opTok.span,
      );
    }
    this.advance();

    const literal = this.parseLiteral();

    return {
      type: "comparison",
      field,
      op,
      value: literal,
      span: mergeSpans(identTok.span, literal.span),
    };
  }

  // "(" literal ("," literal)* ")"
  private parseLiteralList(): { values: Literal[]; endSpan: SourceSpan } {
    this.expect("LParen", "Expected '(' after IN");
    const values: Literal[] = [];
    if (this.peek().kind === "RParen") {
      throw new ParseError("IN list cannot be empty", this.peek().span);
    }
    values.push(this.parseLiteral());
    while (this.peek().kind === "Comma") {
      this.advance();
      values.push(this.parseLiteral());
    }
    const rparen = this.expect("RParen", "Expected ')' or ',' in IN list");
    return { values, endSpan: rparen.span };
  }

  private parseLiteral(): Literal {
    const tok = this.peek();
    switch (tok.kind) {
      case "String":
        this.advance();
        return {
          kind: "string",
          value: tok.stringValue ?? "",
          span: tok.span,
        };
      case "Number":
        this.advance();
        return {
          kind: "number",
          value: tok.numberValue ?? 0,
          span: tok.span,
        };
      case "True":
        this.advance();
        return { kind: "boolean", value: true, span: tok.span };
      case "False":
        this.advance();
        return { kind: "boolean", value: false, span: tok.span };
      case "Null":
        this.advance();
        return { kind: "null", span: tok.span };
      default:
        throw new ParseError(
          `Expected literal value, got ${describeToken(tok)}`,
          tok.span,
        );
    }
  }

  private peek(): Token {
    return this.tokens[this.pos] as Token;
  }

  private advance(): Token {
    const tok = this.tokens[this.pos] as Token;
    if (tok.kind !== "Eof") this.pos += 1;
    return tok;
  }

  expect(kind: TokenKind, message: string): Token {
    const tok = this.peek();
    if (tok.kind !== kind) {
      throw new ParseError(`${message}, got ${describeToken(tok)}`, tok.span);
    }
    return this.advance();
  }
}

function makeLogical(
  op: "AND" | "OR",
  children: [ParsedNode, ParsedNode],
): LogicalNode {
  return {
    type: "logical",
    op,
    children,
    span: mergeSpans(children[0].span, children[1].span),
  };
}

function mergeSpans(a: SourceSpan, b: SourceSpan): SourceSpan {
  const start = a.offset <= b.offset ? a : b;
  const endSpan = a.offset + a.length >= b.offset + b.length ? a : b;
  const endOffset = endSpan.offset + endSpan.length;
  return {
    line: start.line,
    column: start.column,
    offset: start.offset,
    length: endOffset - start.offset,
  };
}

function describeToken(tok: Token): string {
  if (tok.kind === "Eof") return "end of input";
  if (tok.text) return `'${tok.text}'`;
  return tok.kind;
}
