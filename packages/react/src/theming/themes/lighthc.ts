import type { NubaseTheme } from "../theme";

export const lighthc: NubaseTheme = {
  name: "Light High Contrast",
  type: "light",
  id: "lighthc",
  colors: {
    // Primary colors - Deep blue with maximum contrast
    primary: "#0000FF",
    onPrimary: "#FFFFFF",
    primaryContainer: "#E6F3FF",
    onPrimaryContainer: "#000066",

    // Secondary colors - Deep purple
    secondary: "#800080",
    onSecondary: "#FFFFFF",
    secondaryContainer: "#F3E6F3",
    onSecondaryContainer: "#330033",

    // Tertiary colors - Deep green
    tertiary: "#008000",
    onTertiary: "#FFFFFF",
    tertiaryContainer: "#E6F3E6",
    onTertiaryContainer: "#003300",

    // Error colors - Pure red with maximum contrast
    error: "#FF0000",
    onError: "#FFFFFF",
    errorContainer: "#FFE6E6",
    onErrorContainer: "#660000",

    // Surface colors - Pure white base with black text
    surface: "#FFFFFF",
    onSurface: "#000000",
    surfaceVariant: "#F5F5F5",
    onSurfaceVariant: "#000000",

    // Other colors - Maximum contrast outlines
    outline: "#000000",
    outlineVariant: "#666666",
    shadow: "#000000",
    scrim: "#000000",
    inverseSurface: "#000000",
    onInverseSurface: "#FFFFFF",
  },
};
