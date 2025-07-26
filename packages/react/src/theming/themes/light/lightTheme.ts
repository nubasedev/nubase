import type { NubaseTheme } from "../../theme";

export const lightTheme: NubaseTheme = {
  name: "Light",
  type: "light",
  id: "light",
  colors: {
    // Primary colors - Modern vibrant blue-purple
    primary: "#6366F1",
    onPrimary: "#FFFFFF",
    primaryContainer: "#E0E7FF",
    onPrimaryContainer: "#1E1B4B",

    // Secondary colors - Sophisticated slate
    secondary: "#64748B",
    onSecondary: "#FFFFFF",
    secondaryContainer: "#E2E8F0",
    onSecondaryContainer: "#0F172A",

    // Tertiary colors - Warm emerald accent
    tertiary: "#059669",
    onTertiary: "#FFFFFF",
    tertiaryContainer: "#D1FAE5",
    onTertiaryContainer: "#064E3B",

    // Error colors - Modern red
    error: "#DC2626",
    onError: "#FFFFFF",
    errorContainer: "#FEE2E2",
    onErrorContainer: "#7F1D1D",

    // Surface colors - Clean neutral base
    surface: "#FFFFFF",
    onSurface: "#0F172A",
    surfaceVariant: "#F8FAFC",
    onSurfaceVariant: "#475569",

    // Other colors
    outline: "#CBD5E1",
    outlineVariant: "#E2E8F0",
    shadow: "#000000",
    scrim: "#000000",
    inverseSurface: "#0F172A",
    onInverseSurface: "#F8FAFC",
  },
};
