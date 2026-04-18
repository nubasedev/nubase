import type { ObjectSchema } from "@nubase/core";
import type * as MonacoNs from "monaco-editor/esm/vs/editor/editor.api";

type Monaco = typeof MonacoNs;

export const NQL_LANGUAGE_ID = "nql";

/**
 * Global, language-level keywords. Always offered as completions so users
 * can discover the grammar even without knowing the fields.
 */
const KEYWORDS = [
  "AND",
  "OR",
  "NOT",
  "IS",
  "NULL",
  "IN",
  "TRUE",
  "FALSE",
] as const;

// Monaco snippet tab-stop placeholder. Written as a separate constant so
// Biome doesn't mistake the `${1}` in string literals for a misplaced
// JavaScript template interpolation.
const TAB = "\u0024{1}";

const KEYWORD_SNIPPETS: Array<{
  label: string;
  insertText: string;
  detail: string;
}> = [
  { label: "AND", insertText: "AND ", detail: "Logical AND" },
  { label: "OR", insertText: "OR ", detail: "Logical OR" },
  { label: "NOT", insertText: "NOT ", detail: "Logical NOT" },
  { label: "IS NULL", insertText: "IS NULL", detail: "Null check" },
  { label: "IS NOT NULL", insertText: "IS NOT NULL", detail: "Non-null check" },
  {
    label: "CONTAINS",
    insertText: `CONTAINS "${TAB}"`,
    detail: "Case-insensitive substring match",
  },
  {
    label: "STARTS_WITH",
    insertText: `STARTS_WITH "${TAB}"`,
    detail: "Case-insensitive prefix match",
  },
  {
    label: "ENDS_WITH",
    insertText: `ENDS_WITH "${TAB}"`,
    detail: "Case-insensitive suffix match",
  },
  {
    label: "IN",
    insertText: `IN (${TAB})`,
    detail: "Set membership",
  },
  {
    label: "NOT IN",
    insertText: `NOT IN (${TAB})`,
    detail: "Exclusion from set",
  },
  { label: "TRUE", insertText: "true", detail: "Boolean literal" },
  { label: "FALSE", insertText: "false", detail: "Boolean literal" },
];

const registeredMonacoInstances = new WeakSet<object>();

/**
 * Register the NQL language (tokens provider, bracket config) with the
 * given Monaco instance. Safe to call multiple times — only the first
 * call per instance has effect.
 */
export function ensureNqlLanguageRegistered(monaco: Monaco): void {
  if (registeredMonacoInstances.has(monaco as unknown as object)) return;
  registeredMonacoInstances.add(monaco as unknown as object);

  monaco.languages.register({ id: NQL_LANGUAGE_ID });

  monaco.languages.setLanguageConfiguration(NQL_LANGUAGE_ID, {
    brackets: [["(", ")"]],
    autoClosingPairs: [
      { open: "(", close: ")" },
      { open: '"', close: '"' },
    ],
    surroundingPairs: [
      { open: "(", close: ")" },
      { open: '"', close: '"' },
    ],
  });

  monaco.languages.setMonarchTokensProvider(NQL_LANGUAGE_ID, {
    ignoreCase: true,
    keywords: [...KEYWORDS],
    operators: [
      "=",
      "!=",
      "<",
      "<=",
      ">",
      ">=",
      "CONTAINS",
      "STARTS_WITH",
      "ENDS_WITH",
    ],
    symbols: /[=!<>]+/,
    tokenizer: {
      root: [
        [/"(?:[^"\\]|\\.)*"/, "string"],
        [/-?\d+(?:\.\d+)?/, "number"],
        [
          /[A-Za-z_][A-Za-z0-9_]*/,
          {
            cases: {
              "@keywords": "keyword",
              "CONTAINS|STARTS_WITH|ENDS_WITH": "keyword",
              "@default": "identifier",
            },
          },
        ],
        [/[()]/, "@brackets"],
        [/,/, "delimiter"],
        [/@symbols/, "operator"],
        [/\s+/, "white"],
      ],
    },
  });
}

/**
 * Register a completion provider for the current NQL editor that draws
 * field-name suggestions from the given schema. Returns a disposable so
 * the provider can be removed when the editor unmounts.
 */
export function registerNqlCompletionProvider(
  monaco: Monaco,
  schema: ObjectSchema<any>,
): MonacoNs.IDisposable {
  ensureNqlLanguageRegistered(monaco);

  const fields = extractFieldSuggestions(schema);
  console.info(
    "[nql-editor] completion provider registered; fields:",
    fields.map((f) => f.name),
  );

  return monaco.languages.registerCompletionItemProvider(NQL_LANGUAGE_ID, {
    triggerCharacters: [
      " ",
      "(",
      '"',
      ...Array.from("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_"),
    ],
    provideCompletionItems: (model, position) => {
      console.info("[nql-editor] provideCompletionItems called", {
        lang: model.getLanguageId(),
        line: position.lineNumber,
        column: position.column,
        lineText: model.getLineContent(position.lineNumber),
      });
      const word = model.getWordUntilPosition(position);
      const range: MonacoNs.IRange = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const suggestions: MonacoNs.languages.CompletionItem[] = [];

      for (const field of fields) {
        suggestions.push({
          label: field.label,
          kind: monaco.languages.CompletionItemKind.Field,
          insertText: field.name,
          detail: field.detail,
          sortText: `0_${field.name}`,
          range,
        });
      }

      for (const snippet of KEYWORD_SNIPPETS) {
        suggestions.push({
          label: snippet.label,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: snippet.insertText,
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: snippet.detail,
          sortText: `1_${snippet.label}`,
          range,
        });
      }

      console.info("[nql-editor] returning suggestions:", suggestions.length);
      return { suggestions };
    },
  });
}

interface FieldSuggestion {
  name: string;
  label: string;
  detail: string;
}

function extractFieldSuggestions(schema: ObjectSchema<any>): FieldSuggestion[] {
  const out: FieldSuggestion[] = [];
  const shape = schema._shape as Record<
    string,
    { type: string; baseType?: string }
  >;
  for (const name of Object.keys(shape)) {
    // Skip the search/NQL meta fields that the filter-bar wraps every
    // endpoint with — they aren't queryable via NQL itself.
    if (name === "q" || name === "nql") continue;
    const field = shape[name];
    if (!field) continue;
    const baseType = field.baseType ?? field.type;
    out.push({
      name,
      label: name,
      detail: `field · ${baseType}`,
    });
  }
  return out;
}
