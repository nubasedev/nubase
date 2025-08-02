import type { NubaseTheme } from "../../theming/theme";

// WCAG Contrast Requirements - Centralized Configuration
// WCAG Level A: No specific contrast requirements
// WCAG Level AA: 4.5:1 for normal text, 3:1 for large text (18pt+ or 14pt+ bold), 3:1 for UI components
// WCAG Level AAA: 7:1 for normal text, 4.5:1 for large text, 3:1 for UI components

/** Normal text contrast (WCAG AA: 4.5:1, WCAG AAA: 7:1) */
const TEXT_CONTRAST_MIN = 3.5;

/** Large text contrast - 18pt+ or 14pt+ bold (WCAG AA: 3:1, WCAG AAA: 4.5:1) */
const LARGE_TEXT_CONTRAST_MIN = 2.5;

/** UI components and interactive elements (WCAG AA: 3:1, WCAG AAA: 3:1) */
const UI_CONTRAST_MIN = 2.5;

/**
 * Converts a hex color to RGB values
 */
function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result || !result[1] || !result[2] || !result[3]) {
    return null;
  }
  return [
    Number.parseInt(result[1], 16),
    Number.parseInt(result[2], 16),
    Number.parseInt(result[3], 16),
  ];
}

/**
 * Calculates the relative luminance of a color
 * Based on WCAG 2.1 formula: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const normalized = c / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculates the contrast ratio between two colors
 * Returns a value between 1 and 21
 */
function getContrastRatio(color1: string, color2: string): number | null {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return null;

  const lum1 = getLuminance(rgb1[0], rgb1[1], rgb1[2]);
  const lum2 = getLuminance(rgb2[0], rgb2[1], rgb2[2]);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Validates Material Design 3 theme colors against WCAG contrast requirements
 * Shows console errors for non-compliant color pairs
 */
export function validateThemeColors(theme: NubaseTheme): void {
  const { colors } = theme;

  // Define color pairs to validate based on Material Design 3 usage patterns
  const textColorPairs = [
    // Primary text pairs
    {
      background: colors.primary,
      foreground: colors.onPrimary,
      name: "primary/onPrimary",
    },
    {
      background: colors.primaryContainer,
      foreground: colors.onPrimaryContainer,
      name: "primaryContainer/onPrimaryContainer",
    },

    // Secondary text pairs
    {
      background: colors.secondary,
      foreground: colors.onSecondary,
      name: "secondary/onSecondary",
    },
    {
      background: colors.secondaryContainer,
      foreground: colors.onSecondaryContainer,
      name: "secondaryContainer/onSecondaryContainer",
    },

    // Tertiary text pairs
    {
      background: colors.tertiary,
      foreground: colors.onTertiary,
      name: "tertiary/onTertiary",
    },
    {
      background: colors.tertiaryContainer,
      foreground: colors.onTertiaryContainer,
      name: "tertiaryContainer/onTertiaryContainer",
    },

    // Error text pairs
    {
      background: colors.error,
      foreground: colors.onError,
      name: "error/onError",
    },
    {
      background: colors.errorContainer,
      foreground: colors.onErrorContainer,
      name: "errorContainer/onErrorContainer",
    },

    // Surface text pairs
    {
      background: colors.surface,
      foreground: colors.onSurface,
      name: "surface/onSurface",
    },
    {
      background: colors.surfaceVariant,
      foreground: colors.onSurfaceVariant,
      name: "surfaceVariant/onSurfaceVariant",
    },
    {
      background: colors.inverseSurface,
      foreground: colors.onInverseSurface,
      name: "inverseSurface/onInverseSurface",
    },
  ];

  // UI component color pairs (buttons, form elements, etc.)
  const uiColorPairs = [
    {
      background: colors.surface,
      foreground: colors.outline,
      name: "surface/outline (borders)",
    },
    {
      background: colors.surface,
      foreground: colors.outlineVariant,
      name: "surface/outlineVariant (subtle borders)",
    },
    {
      background: colors.surfaceVariant,
      foreground: colors.outline,
      name: "surfaceVariant/outline",
    },
  ];

  console.group(`🎨 Validating theme colors: ${theme.name} (${theme.id})`);

  let hasErrors = false;

  // Validate text contrast ratios
  for (const pair of textColorPairs) {
    const ratio = getContrastRatio(pair.background, pair.foreground);
    if (ratio === null) {
      console.warn(
        `⚠️  Invalid color format in ${pair.name}: ${pair.background} / ${pair.foreground}`,
      );
      hasErrors = true;
      continue;
    }

    if (ratio < TEXT_CONTRAST_MIN) {
      console.warn(
        `⚠️  Text contrast too low for ${pair.name}: ${ratio.toFixed(2)}:1 (minimum: ${TEXT_CONTRAST_MIN}:1)\n` +
          `   Background: ${pair.background} | Foreground: ${pair.foreground}`,
      );
      hasErrors = true;
    } else if (ratio < LARGE_TEXT_CONTRAST_MIN * 1.5) {
      // Show info for borderline cases
      console.info(
        `ℹ️  Text contrast borderline for ${pair.name}: ${ratio.toFixed(2)}:1\n` +
          `   Background: ${pair.background} | Foreground: ${pair.foreground}`,
      );
    }
  }

  // Validate UI component contrast ratios
  for (const pair of uiColorPairs) {
    const ratio = getContrastRatio(pair.background, pair.foreground);
    if (ratio === null) {
      console.warn(
        `⚠️  Invalid color format in ${pair.name}: ${pair.background} / ${pair.foreground}`,
      );
      hasErrors = true;
      continue;
    }

    if (ratio < UI_CONTRAST_MIN) {
      console.warn(
        `⚠️  UI component contrast too low for ${pair.name}: ${ratio.toFixed(2)}:1 (minimum: ${UI_CONTRAST_MIN}:1)\n` +
          `   Background: ${pair.background} | Foreground: ${pair.foreground}`,
      );
      hasErrors = true;
    }
  }

  if (!hasErrors) {
    console.log(
      "✅ All color contrasts meet custom accessibility standards (relaxed from WCAG AA)",
    );
  }

  console.groupEnd();
}
