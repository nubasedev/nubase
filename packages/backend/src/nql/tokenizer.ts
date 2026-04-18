import type { NqlError, Result, SourceSpan, Token, TokenKind } from "./types";

const KEYWORDS: Record<string, TokenKind> = {
  AND: "And",
  OR: "Or",
  NOT: "Not",
  IS: "Is",
  IN: "In",
  TRUE: "True",
  FALSE: "False",
  NULL: "Null",
  CONTAINS: "Contains",
  STARTS_WITH: "StartsWith",
  ENDS_WITH: "EndsWith",
};

export function tokenize(source: string): Result<Token[], NqlError> {
  const tokens: Token[] = [];
  let offset = 0;
  let line = 1;
  let column = 1;

  const makeSpan = (
    startOffset: number,
    startLine: number,
    startColumn: number,
  ): SourceSpan => ({
    line: startLine,
    column: startColumn,
    offset: startOffset,
    length: offset - startOffset,
  });

  const err = (
    message: string,
    atLine: number,
    atColumn: number,
    length = 1,
  ): Result<Token[], NqlError> => ({
    ok: false,
    error: {
      code: "TOKENIZE",
      message,
      line: atLine,
      column: atColumn,
      length,
    },
  });

  const advance = (ch: string) => {
    offset += 1;
    if (ch === "\n") {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
  };

  while (offset < source.length) {
    const ch = source[offset] as string;

    // Whitespace
    if (ch === " " || ch === "\t" || ch === "\r" || ch === "\n") {
      advance(ch);
      continue;
    }

    const startOffset = offset;
    const startLine = line;
    const startColumn = column;

    // Parentheses
    if (ch === "(") {
      advance(ch);
      tokens.push({
        kind: "LParen",
        span: makeSpan(startOffset, startLine, startColumn),
        text: "(",
      });
      continue;
    }
    if (ch === ")") {
      advance(ch);
      tokens.push({
        kind: "RParen",
        span: makeSpan(startOffset, startLine, startColumn),
        text: ")",
      });
      continue;
    }
    if (ch === ",") {
      advance(ch);
      tokens.push({
        kind: "Comma",
        span: makeSpan(startOffset, startLine, startColumn),
        text: ",",
      });
      continue;
    }

    // Comparison operators: =, !=, <, <=, >, >=
    if (ch === "=") {
      advance(ch);
      tokens.push({
        kind: "Eq",
        span: makeSpan(startOffset, startLine, startColumn),
        text: "=",
      });
      continue;
    }
    if (ch === "!") {
      const next = source[offset + 1];
      if (next === "=") {
        advance(ch);
        advance(next);
        tokens.push({
          kind: "NotEq",
          span: makeSpan(startOffset, startLine, startColumn),
          text: "!=",
        });
        continue;
      }
      return err(`Unexpected character '!'`, startLine, startColumn);
    }
    if (ch === "<") {
      const next = source[offset + 1];
      if (next === "=") {
        advance(ch);
        advance(next);
        tokens.push({
          kind: "LtEq",
          span: makeSpan(startOffset, startLine, startColumn),
          text: "<=",
        });
      } else {
        advance(ch);
        tokens.push({
          kind: "Lt",
          span: makeSpan(startOffset, startLine, startColumn),
          text: "<",
        });
      }
      continue;
    }
    if (ch === ">") {
      const next = source[offset + 1];
      if (next === "=") {
        advance(ch);
        advance(next);
        tokens.push({
          kind: "GtEq",
          span: makeSpan(startOffset, startLine, startColumn),
          text: ">=",
        });
      } else {
        advance(ch);
        tokens.push({
          kind: "Gt",
          span: makeSpan(startOffset, startLine, startColumn),
          text: ">",
        });
      }
      continue;
    }

    // String literal: "..." with \" and \\ escapes
    if (ch === '"') {
      advance(ch);
      let value = "";
      let closed = false;
      while (offset < source.length) {
        const c = source[offset] as string;
        if (c === "\\") {
          const next = source[offset + 1];
          if (next === '"' || next === "\\") {
            value += next;
            advance(c);
            advance(next as string);
            continue;
          }
          return err(
            `Invalid escape sequence '\\${next ?? ""}'`,
            line,
            column,
            2,
          );
        }
        if (c === '"') {
          advance(c);
          closed = true;
          break;
        }
        if (c === "\n") {
          return err("Unterminated string literal", startLine, startColumn);
        }
        value += c;
        advance(c);
      }
      if (!closed) {
        return err("Unterminated string literal", startLine, startColumn);
      }
      const span = makeSpan(startOffset, startLine, startColumn);
      tokens.push({
        kind: "String",
        span,
        text: source.slice(startOffset, offset),
        stringValue: value,
      });
      continue;
    }

    // Number literal: optional leading -, digits, optional decimal
    if (isDigit(ch) || (ch === "-" && isDigit(source[offset + 1] ?? ""))) {
      if (ch === "-") advance(ch);
      while (offset < source.length && isDigit(source[offset] as string)) {
        advance(source[offset] as string);
      }
      if (source[offset] === ".") {
        const afterDot = source[offset + 1];
        if (!afterDot || !isDigit(afterDot)) {
          return err("Expected digit after decimal point", line, column);
        }
        advance(".");
        while (offset < source.length && isDigit(source[offset] as string)) {
          advance(source[offset] as string);
        }
      }
      const text = source.slice(startOffset, offset);
      const parsed = Number(text);
      if (!Number.isFinite(parsed)) {
        return err(
          `Invalid number '${text}'`,
          startLine,
          startColumn,
          text.length,
        );
      }
      tokens.push({
        kind: "Number",
        span: makeSpan(startOffset, startLine, startColumn),
        text,
        numberValue: parsed,
      });
      continue;
    }

    // Identifier or keyword: [A-Za-z_][A-Za-z0-9_]*
    if (isIdentStart(ch)) {
      while (offset < source.length && isIdentPart(source[offset] as string)) {
        advance(source[offset] as string);
      }
      const text = source.slice(startOffset, offset);
      const upper = text.toUpperCase();
      const span = makeSpan(startOffset, startLine, startColumn);
      const keywordKind = KEYWORDS[upper];
      if (keywordKind) {
        tokens.push({ kind: keywordKind, span, text });
      } else {
        tokens.push({ kind: "Identifier", span, text });
      }
      continue;
    }

    return err(`Unexpected character '${ch}'`, startLine, startColumn);
  }

  tokens.push({
    kind: "Eof",
    span: { line, column, offset, length: 0 },
    text: "",
  });

  return { ok: true, value: tokens };
}

function isDigit(ch: string): boolean {
  return ch >= "0" && ch <= "9";
}

function isIdentStart(ch: string): boolean {
  return (ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z") || ch === "_";
}

function isIdentPart(ch: string): boolean {
  return isIdentStart(ch) || isDigit(ch);
}
