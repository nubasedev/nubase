import type { NubaseTheme } from "../../theme";

export const darkHighContrastTheme: NubaseTheme = {
  name: "Dark High Contrast",
  type: "dark",
  id: "darkhc",
  colors: {
    // Primary colors - Maximum contrast bright cyan
    primary: "#00FFFF",
    onPrimary: "#000000",
    primaryContainer: "#003333",
    onPrimaryContainer: "#00FFFF",

    // Secondary colors - High contrast yellow
    secondary: "#FFFF00",
    onSecondary: "#000000",
    secondaryContainer: "#333300",
    onSecondaryContainer: "#FFFF00",

    // Tertiary colors - Bright magenta
    tertiary: "#FF00FF",
    onTertiary: "#000000",
    tertiaryContainer: "#330033",
    onTertiaryContainer: "#FF00FF",

    // Error colors - Pure red with maximum contrast
    error: "#FF0000",
    onError: "#000000",
    errorContainer: "#330000",
    onErrorContainer: "#FF0000",

    // Surface colors - Pure black base with white text
    surface: "#000000",
    onSurface: "#FFFFFF",
    surfaceVariant: "#1A1A1A",
    onSurfaceVariant: "#FFFFFF",

    // Other colors - Maximum contrast outlines
    outline: "#FFFFFF",
    outlineVariant: "#CCCCCC",
    shadow: "#000000",
    scrim: "#000000",
    inverseSurface: "#FFFFFF",
    onInverseSurface: "#000000",
  },
};