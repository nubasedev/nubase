import type { ObjectSchema } from "@nubase/core";
import type * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
// Side-effect imports: register the Monaco contributions required for
// completions. `react-monaco-editor` pulls only the slim editor API, so any
// custom-language editor has to opt into these explicitly — otherwise
// `editor.getAction("editor.action.triggerSuggest")` returns null and the
// suggest widget never renders.
import "monaco-editor/esm/vs/editor/contrib/suggest/browser/suggestController.js";
import "monaco-editor/esm/vs/editor/contrib/snippet/browser/snippetController2.js";
import { useEffect, useRef } from "react";
import ReactMonacoEditor, {
  type EditorDidMount,
  type EditorWillMount,
} from "react-monaco-editor";
import { cn } from "../../styling/cn";
import {
  ensureNqlLanguageRegistered,
  NQL_LANGUAGE_ID,
  registerNqlCompletionProvider,
} from "./nql-language";

export interface NqlEditorProps {
  /** The schema that defines which fields are queryable. */
  schema: ObjectSchema<any>;
  /** Current NQL source value. */
  value: string;
  /** Called on every content change. */
  onChange: (value: string) => void;
  /** Optional error message shown below the editor (e.g. from backend 400). */
  errorMessage?: string;
  /** Explicit height. Defaults to a single-line-ish 40px. */
  height?: number | string;
  /** Placeholder-like hint text when value is empty. */
  placeholder?: string;
  /** Extra classes for the outer container. */
  className?: string;
}

/**
 * Monaco-backed NQL input. Registers the NQL language lazily and attaches
 * a schema-driven completion provider for the lifetime of the component.
 */
export function NqlEditor({
  schema,
  value,
  onChange,
  errorMessage,
  height = 40,
  placeholder = 'Type NQL — e.g. Title CONTAINS "override"',
  className,
}: NqlEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(
    null,
  );
  const monacoRef = useRef<typeof monacoEditor | null>(null);
  const completionDisposableRef = useRef<monacoEditor.IDisposable | null>(null);

  // `editorWillMount` gives us the exact monaco instance react-monaco-editor
  // will hand to `monaco.editor.create`. Registering the language here
  // guarantees Monaco knows "nql" before the model is created — otherwise
  // it silently falls back to plaintext and no tokens / completions fire.
  const handleEditorWillMount: EditorWillMount = (monaco) => {
    monacoRef.current = monaco;
    ensureNqlLanguageRegistered(monaco);
    console.info("[nql-editor] editorWillMount: language registered");
  };

  const handleEditorDidMount: EditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    const model = editor.getModel();
    console.info(
      "[nql-editor] editorDidMount: model language =",
      model?.getLanguageId(),
    );
    if (model && model.getLanguageId() !== NQL_LANGUAGE_ID) {
      monaco.editor.setModelLanguage(model, NQL_LANGUAGE_ID);
      console.info(
        "[nql-editor] forced setModelLanguage → nql; now:",
        model.getLanguageId(),
      );
    }
    // Register the schema-driven completion provider against the editor's
    // monaco instance so we can't accidentally target a different copy.
    completionDisposableRef.current = registerNqlCompletionProvider(
      monaco,
      schema,
    );
    // Disable suggestion auto-acceptance on Enter — users keep Tab for that.
    editor.updateOptions({ acceptSuggestionOnEnter: "off" });

    // Explicit keybindings so completions are reachable even when the
    // default Ctrl+Space is eaten by the OS (macOS input-source switcher).
    // `WinCtrl` is the actual Ctrl key on macOS (vs `CtrlCmd` which maps to ⌘).
    const triggerSuggest = () => {
      const action = editor.getAction("editor.action.triggerSuggest");
      console.info(
        "[nql-editor] getAction('editor.action.triggerSuggest') →",
        action ? `id=${action.id}` : "NOT FOUND",
      );
      if (action) {
        void action.run();
      } else {
        editor.trigger("keyboard", "editor.action.triggerSuggest", {});
      }
    };
    editor.addCommand(monaco.KeyMod.WinCtrl | monaco.KeyCode.Space, () => {
      console.info("[nql-editor] Ctrl+Space fired");
      triggerSuggest();
    });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI, () => {
      console.info("[nql-editor] Cmd/Ctrl+I fired");
      triggerSuggest();
    });
  };

  // Re-register the completion provider when the schema changes (and dispose
  // on unmount).
  useEffect(() => {
    const monaco = monacoRef.current;
    if (!monaco) return; // editor hasn't mounted yet; handleEditorDidMount will register
    completionDisposableRef.current?.dispose();
    completionDisposableRef.current = registerNqlCompletionProvider(
      monaco,
      schema,
    );
    return () => {
      completionDisposableRef.current?.dispose();
      completionDisposableRef.current = null;
    };
  }, [schema]);

  // Re-layout when the container resizes (e.g., filter bar width changes).
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => {
      editorRef.current?.layout();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={cn("flex-1 min-w-0", className)}>
      <div
        ref={containerRef}
        className={cn(
          "relative rounded-md border border-input bg-transparent dark:bg-input/30",
          "shadow-xs",
          errorMessage && "border-destructive",
        )}
        style={{ height }}
      >
        <ReactMonacoEditor
          width="100%"
          height="100%"
          language={NQL_LANGUAGE_ID}
          value={value}
          onChange={onChange}
          editorWillMount={handleEditorWillMount}
          editorDidMount={handleEditorDidMount}
          options={{
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
            fontSize: 13,
            padding: { top: 10, bottom: 0 },
            fixedOverflowWidgets: true,
            contextmenu: false,
            quickSuggestions: {
              other: true,
              comments: false,
              strings: false,
            },
            suggestOnTriggerCharacters: true,
            tabCompletion: "on",
          }}
        />
        {value === "" && (
          <div
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
            aria-hidden
          >
            {placeholder}
          </div>
        )}
      </div>
      {errorMessage && (
        <div
          role="alert"
          className="mt-1 text-xs text-destructive"
          data-slot="nql-editor-error"
        >
          {errorMessage}
        </div>
      )}
    </div>
  );
}

NqlEditor.displayName = "NqlEditor";
