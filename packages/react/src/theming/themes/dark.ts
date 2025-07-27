import type { NubaseTheme } from "../theme";

export const dark: NubaseTheme = {
  name: "Dark",
  type: "dark",
  id: "dark",
  colors: {
    // Primary colors - Bright modern indigo
    primary: "#818CF8",
    onPrimary: "#1E1B4B",
    primaryContainer: "#312E81",
    onPrimaryContainer: "#E0E7FF",

    // Secondary colors - Cool slate tones
    secondary: "#94A3B8",
    onSecondary: "#1E293B",
    secondaryContainer: "#334155",
    onSecondaryContainer: "#E2E8F0",

    // Tertiary colors - Vibrant emerald
    tertiary: "#34D399",
    onTertiary: "#064E3B",
    tertiaryContainer: "#065F46",
    onTertiaryContainer: "#D1FAE5",

    // Error colors - Soft red for dark mode
    error: "#F87171",
    onError: "#7F1D1D",
    errorContainer: "#991B1B",
    onErrorContainer: "#FEE2E2",

    // Surface colors - Rich dark base
    surface: "#0F172A",
    onSurface: "#F8FAFC",
    surfaceVariant: "#1E293B",
    onSurfaceVariant: "#CBD5E1",

    // Other colors
    outline: "#475569",
    outlineVariant: "#64748B",
    shadow: "#000000",
    scrim: "#000000",
    inverseSurface: "#F8FAFC",
    onInverseSurface: "#0F172A",
  },
};
