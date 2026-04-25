import * as monaco from "monaco-editor";

/**
 * Maps Nubase's shadcn-style CSS variables into a Monaco editor theme so
 * the NQL editor and its suggest widget match the host app's active
 * palette. Colors are resolved at apply time and re-resolved whenever the
 * host document's `data-theme` attribute changes.
 */

export const NUBASE_MONACO_THEME_ID = "nubase";

type ColorToken = {
  /** Nubase CSS variable name. */
  cssVar: string;
  /** Fallback used when the variable resolves to nothing (e.g. tests). */
  fallback: string;
};

/**
 * The 4 syntax "slots" the editor uses, each pinned to a theme var:
 *
 *   identifier (variables/fields)  →  --foreground
 *   keyword    (CONTAINS, AND …)   →  --chart3
 *   string     ("hello")            →  --chart1
 *   number     (42)                 →  --chart2
 *
 * All plumbing colors (editor bg, selection, suggest widget …) come from
 * the same theme too, so the whole component is fully driven by the
 * active Nubase theme.
 */
const COLOR_TOKENS = {
  background: { cssVar: "--background", fallback: "#ffffff" },
  foreground: { cssVar: "--foreground", fallback: "#0a0a0a" },
  primary: { cssVar: "--primary", fallback: "#1f2937" },
  popover: { cssVar: "--popover", fallback: "#ffffff" },
  popoverForeground: { cssVar: "--popover-foreground", fallback: "#0a0a0a" },
  accent: { cssVar: "--accent", fallback: "#e5e7eb" },
  accentForeground: { cssVar: "--accent-foreground", fallback: "#0a0a0a" },
  mutedForeground: { cssVar: "--muted-foreground", fallback: "#6b7280" },
  border: { cssVar: "--border", fallback: "#e5e7eb" },
  ring: { cssVar: "--ring", fallback: "#a3a3a3" },
  // Syntax slots:
  syntaxKeyword: { cssVar: "--chart3", fallback: "#0ea5e9" },
  syntaxString: { cssVar: "--chart1", fallback: "#f97316" },
  syntaxNumber: { cssVar: "--chart2", fallback: "#10b981" },
} satisfies Record<string, ColorToken>;

type ResolvedPalette = Record<keyof typeof COLOR_TOKENS, string>;

let installed = false;

/**
 * Install the Nubase Monaco theme and keep it in sync when the host
 * document's `data-theme` attribute changes. Idempotent — safe to call
 * from every editor mount.
 */
export function installNubaseMonacoTheme(): void {
  if (typeof document === "undefined") return;
  applyTheme();

  if (installed) return;
  installed = true;

  const observer = new MutationObserver(() => applyTheme());
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme", "class", "style"],
  });
}

function applyTheme(): void {
  const palette = resolvePalette();
  const isDark = isDarkBackground(palette.background);
  const stripHash = (hex: string) => hex.replace(/^#/, "").slice(0, 6);

  console.debug("[nql-editor] theme applied", {
    isDark,
    dataTheme: document.documentElement.getAttribute("data-theme"),
    palette,
  });

  monaco.editor.defineTheme(NUBASE_MONACO_THEME_ID, {
    base: isDark ? "vs-dark" : "vs",
    // `inherit: false` so the base theme's default token rules don't
    // shadow ours (e.g. vs-dark paints `keyword` as #569CD6 which would
    // override our CSS-var-driven keyword color).
    inherit: false,
    rules: [
      { token: "", foreground: stripHash(palette.foreground) },
      {
        token: "keyword",
        foreground: stripHash(palette.syntaxKeyword),
        fontStyle: "bold",
      },
      { token: "operator", foreground: stripHash(palette.syntaxKeyword) },
      { token: "string", foreground: stripHash(palette.syntaxString) },
      { token: "number", foreground: stripHash(palette.syntaxNumber) },
      { token: "identifier", foreground: stripHash(palette.foreground) },
      { token: "delimiter", foreground: stripHash(palette.mutedForeground) },
    ],
    colors: {
      // Editor body — transparent so the wrapping Tailwind container with
      // `bg-background` shows through.
      "editor.background": "#00000000",
      "editor.foreground": palette.foreground,
      "editorCursor.foreground": palette.foreground,
      "editor.selectionBackground": withAlpha(palette.ring, 0.35),
      "editor.inactiveSelectionBackground": withAlpha(palette.ring, 0.2),
      "editorWhitespace.foreground": withAlpha(palette.mutedForeground, 0.25),

      // Suggest widget (completion popup).
      "editorWidget.background": palette.popover,
      "editorWidget.foreground": palette.popoverForeground,
      "editorWidget.border": palette.border,
      "editorSuggestWidget.background": palette.popover,
      "editorSuggestWidget.foreground": palette.popoverForeground,
      "editorSuggestWidget.border": palette.border,
      "editorSuggestWidget.selectedBackground": palette.accent,
      "editorSuggestWidget.selectedForeground": palette.accentForeground,
      "editorSuggestWidget.focusHighlightForeground": palette.syntaxKeyword,
      "editorSuggestWidget.highlightForeground": palette.syntaxKeyword,

      // Hover widget.
      "editorHoverWidget.background": palette.popover,
      "editorHoverWidget.foreground": palette.popoverForeground,
      "editorHoverWidget.border": palette.border,

      // Scrollbars (mostly hidden here but skin for completeness).
      "scrollbarSlider.background": withAlpha(palette.mutedForeground, 0.3),
      "scrollbarSlider.hoverBackground": withAlpha(
        palette.mutedForeground,
        0.5,
      ),
      "scrollbarSlider.activeBackground": withAlpha(
        palette.mutedForeground,
        0.7,
      ),
    },
  });

  monaco.editor.setTheme(NUBASE_MONACO_THEME_ID);
}

/**
 * Resolve every tracked CSS variable to `#rrggbb[aa]`. Uses a throw-away
 * probe element so the browser performs cascade resolution for us — this
 * works correctly even when variables are scoped to `[data-theme="xxx"]`
 * ancestors, and handles `oklch()` / `color()` without us having to know
 * the color grammar.
 *
 * Resolution path for each variable:
 *   1. Set `probe.style.backgroundColor = var(--name, fallback)`.
 *   2. Read `getComputedStyle(probe).backgroundColor`.
 *   3. If that's `rgb(…)` / `rgba(…)`, parse directly.
 *   4. Otherwise (engine returned `oklch(…)` etc.), paint the probe on a
 *      canvas and read the pixel back — always `#rrggbbaa`.
 */
function resolvePalette(): ResolvedPalette {
  const probe = document.createElement("div");
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.pointerEvents = "none";
  probe.style.width = "1px";
  probe.style.height = "1px";
  document.body.appendChild(probe);

  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d");

  try {
    const out = {} as ResolvedPalette;
    for (const [key, token] of Object.entries(COLOR_TOKENS) as Array<
      [keyof typeof COLOR_TOKENS, ColorToken]
    >) {
      out[key] = resolveVar(probe, ctx, token);
    }
    return out;
  } finally {
    probe.remove();
  }
}

function resolveVar(
  probe: HTMLElement,
  ctx: CanvasRenderingContext2D | null,
  token: ColorToken,
): string {
  // Use `backgroundColor` (not `color`) so we can later paint it onto a
  // canvas when the browser serializes to a color space the regex can't
  // parse. `var(--x, fallback)` lets the cascade do the work.
  probe.style.backgroundColor = "";
  probe.style.backgroundColor = `var(${token.cssVar}, ${token.fallback})`;
  const computed = getComputedStyle(probe).backgroundColor;

  const fromRgb = rgbStringToHex(computed);
  if (fromRgb) return fromRgb;

  // Canvas fallback for unusual return formats (`oklch(…)`, `color(…)`).
  if (ctx) {
    try {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = "rgba(0,0,0,0)";
      ctx.fillStyle = computed;
      ctx.fillRect(0, 0, 1, 1);
      const [r = 0, g = 0, b = 0, a = 255] = ctx.getImageData(0, 0, 1, 1)
        .data as Uint8ClampedArray;
      const byte = (n: number) => n.toString(16).padStart(2, "0");
      const base = `#${byte(r)}${byte(g)}${byte(b)}`;
      return a < 255 ? `${base}${byte(a)}` : base;
    } catch {
      /* ignore */
    }
  }
  return token.fallback;
}

function rgbStringToHex(input: string): string | null {
  const m = input.match(/rgba?\(([^)]+)\)/i);
  if (!m?.[1]) return null;
  const parts = m[1].split(/[,\s/]+/).filter(Boolean);
  const r = Number.parseFloat(parts[0] ?? "0");
  const g = Number.parseFloat(parts[1] ?? "0");
  const b = Number.parseFloat(parts[2] ?? "0");
  const a = parts[3] !== undefined ? Number.parseFloat(parts[3]) : 1;
  const byte = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, "0");
  const base = `#${byte(r)}${byte(g)}${byte(b)}`;
  return a < 1 ? `${base}${byte(a * 255)}` : base;
}

/** Overlay an alpha byte onto an `#rrggbb` hex → `#rrggbbaa`. */
function withAlpha(hex: string, alpha: number): string {
  const clean = hex.replace(/^#/, "").slice(0, 6);
  if (clean.length < 6) return hex;
  const byte = Math.max(0, Math.min(255, Math.round(alpha * 255)))
    .toString(16)
    .padStart(2, "0");
  return `#${clean}${byte}`;
}

/** Relative luminance test — used to choose the Monaco base theme. */
function isDarkBackground(hex: string): boolean {
  const clean = hex.replace(/^#/, "").slice(0, 6);
  if (clean.length < 6) return false;
  const r = Number.parseInt(clean.slice(0, 2), 16) / 255;
  const g = Number.parseInt(clean.slice(2, 4), 16) / 255;
  const b = Number.parseInt(clean.slice(4, 6), 16) / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance < 0.5;
}
