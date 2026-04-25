import type { ObjectSchema } from "@nubase/core";
// IMPORTANT: import the full `monaco-editor` barrel — that's the
// `editor.main` entry, which pulls in every standard editor contribution
// (suggest controller, snippet controller, hover, find, …). `react-monaco-editor`
// imports only the slim `editor.api`, which explains why swapping in the
// side-effect imports didn't help: they registered into a module subgraph
// that the editor never loaded.
import * as monaco from "monaco-editor";
import { useEffect, useRef } from "react";
import { cn } from "../../styling/cn";
import {
  installNubaseMonacoTheme,
  NUBASE_MONACO_THEME_ID,
} from "./monaco-theme";
import {
  ensureNqlLanguageRegistered,
  NQL_LANGUAGE_ID,
  registerNqlCompletionProvider,
} from "./nql-language";

// Monaco's editor-only mode still needs a worker for background tasks
// (syntax validation, diffs). Register a minimal one-off environment so
// Monaco doesn't try to fetch a worker from a CDN path that doesn't exist
// under Storybook's Vite dev server.
type MonacoEnv = { getWorker?: (workerId: string, label: string) => Worker };
const w = globalThis as unknown as { MonacoEnvironment?: MonacoEnv };
if (!w.MonacoEnvironment) {
  w.MonacoEnvironment = {
    getWorker() {
      // A tiny no-op worker. Sufficient for editor-only (no language
      // workers). Without this Monaco falls back to its default loader,
      // which throws if no worker URL is configured.
      const blob = new Blob([""], { type: "application/javascript" });
      return new Worker(URL.createObjectURL(blob));
    },
  };
}

export interface NqlEditorProps {
  /** The schema that defines which fields are queryable. */
  schema: ObjectSchema<any>;
  /** Current NQL source value. */
  value: string;
  /** Called on every content change. */
  onChange: (value: string) => void;
  /** Optional error message shown below the editor (e.g. from backend 400). */
  errorMessage?: string;
  /** Placeholder-like hint text when value is empty. */
  placeholder?: string;
  /** Extra classes for the outer container. */
  className?: string;
}

/**
 * Monaco-backed NQL input. Mounts Monaco imperatively (no `react-monaco-editor`)
 * so that `import * as monaco from "monaco-editor"` actually loads the full
 * editor bundle with the suggest and snippet controllers, and our schema-driven
 * completion provider is attached to the exact same Monaco instance the
 * editor is created from.
 */
export function NqlEditor({
  schema,
  value,
  onChange,
  errorMessage,
  placeholder = 'Type NQL — e.g. Title CONTAINS "override"',
  className,
}: NqlEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const completionDisposableRef = useRef<monaco.IDisposable | null>(null);
  const isInternalChangeRef = useRef(false);

  // The `value` / `onChange` props are captured by closure inside the mount
  // effect; use refs so we don't have to re-create the editor on every prop
  // change.
  const latestValueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    latestValueRef.current = value;
  }, [value]);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Create the editor once. `schema` changes are handled by the sibling
  // effect below so we don't tear down and rebuild the editor on each
  // schema identity change.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional one-shot mount
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    ensureNqlLanguageRegistered();
    installNubaseMonacoTheme();

    const editor = monaco.editor.create(container, {
      value: latestValueRef.current,
      language: NQL_LANGUAGE_ID,
      theme: NUBASE_MONACO_THEME_ID,
      automaticLayout: true,
      lineNumbers: "off",
      minimap: { enabled: false },
      folding: false,
      glyphMargin: false,
      lineDecorationsWidth: 8,
      lineNumbersMinChars: 0,
      overviewRulerLanes: 0,
      overviewRulerBorder: false,
      hideCursorInOverviewRuler: true,
      scrollbar: {
        vertical: "hidden",
        horizontal: "hidden",
        handleMouseWheel: false,
      },
      scrollBeyondLastLine: false,
      scrollBeyondLastColumn: 0,
      renderLineHighlight: "none",
      wordWrap: "on",
      wrappingIndent: "same",
      fontSize: 14,
      padding: { top: 7, bottom: 0 },
      fixedOverflowWidgets: true,
      contextmenu: false,
      quickSuggestions: {
        other: true,
        comments: false,
        strings: false,
      },
      suggestOnTriggerCharacters: true,
      tabCompletion: "on",
      acceptSuggestionOnEnter: "on",
    });
    editorRef.current = editor;

    const changeSub = editor.onDidChangeModelContent(() => {
      if (isInternalChangeRef.current) return;
      onChangeRef.current(editor.getValue());
    });

    // Completion provider is bound to the current schema.
    completionDisposableRef.current = registerNqlCompletionProvider(schema);

    return () => {
      changeSub.dispose();
      completionDisposableRef.current?.dispose();
      completionDisposableRef.current = null;
      editor.dispose();
      editorRef.current = null;
    };
  }, []);

  // Re-register completion provider when the schema reference changes.
  useEffect(() => {
    if (!editorRef.current) return;
    completionDisposableRef.current?.dispose();
    completionDisposableRef.current = registerNqlCompletionProvider(schema);
  }, [schema]);

  // Keep the editor in sync with the `value` prop (e.g. when the parent
  // clears it). Avoid overwriting when the user typed the change themselves.
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    if (editor.getValue() === value) return;
    isInternalChangeRef.current = true;
    editor.setValue(value);
    isInternalChangeRef.current = false;
  }, [value]);

  return (
    <div className={cn("relative flex-1 min-w-0", className)}>
      {/*
        Shell mirrors the `textInputVariants` CVA in
        `components/form-controls/controls/TextInput/TextInput.tsx` so the
        NQL editor lines up with every other input in the filter bar:
        h-9, rounded-md, border-input, bg-transparent (with the dark-mode
        input wash), shadow-xs. Monaco renders an inner `<textarea>` that
        receives focus, so `:focus-within` triggers when the user is
        editing — same effective behaviour as TextInput's `:focus-visible`,
        and crucially the same CSS specificity, so `aria-invalid:*`
        variants can override the focus ring on error (a `:has()` selector
        would outrank them and let the focus ring beat destructive).
      */}
      <div
        aria-invalid={errorMessage ? true : undefined}
        className={cn(
          "nql-editor-shell relative flex h-9 w-full min-w-0 overflow-hidden",
          "rounded-md border border-input",
          "bg-transparent dark:bg-input/30",
          "shadow-xs transition-[color,box-shadow]",
          "focus-within:border-ring",
          "focus-within:ring-ring/50 focus-within:ring-[3px]",
          "aria-invalid:border-destructive",
          "aria-invalid:ring-destructive/20",
          "dark:aria-invalid:ring-destructive/40",
        )}
      >
        <div ref={containerRef} className="w-full h-full" />
        {value === "" && (
          <div
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base text-muted-foreground"
            aria-hidden
          >
            {placeholder}
          </div>
        )}
      </div>
      {errorMessage && (
        <div
          role="alert"
          className={cn(
            "absolute left-0 top-full z-10 mt-1 max-w-full w-fit",
            "rounded-md border border-destructive/30 bg-background",
            "px-2 py-1 text-xs text-destructive shadow-md",
          )}
          data-slot="nql-editor-error"
        >
          {errorMessage}
        </div>
      )}
    </div>
  );
}

NqlEditor.displayName = "NqlEditor";
