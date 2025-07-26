import type { NubaseTheme } from "../../theme";

export const lightTheme: NubaseTheme = {
  name: "Light",
  type: "light",
  id: "light",
  colors: {
    // Primary colors
    primary: "#6750A4",
    onPrimary: "#FFFFFF",
    primaryContainer: "#EADDFF",
    onPrimaryContainer: "#21005D",

    // Secondary colors
    secondary: "#625B71",
    onSecondary: "#FFFFFF",
    secondaryContainer: "#E8DEF8",
    onSecondaryContainer: "#1D192B",

    // Tertiary colors
    tertiary: "#7D5260",
    onTertiary: "#FFFFFF",
    tertiaryContainer: "#FFD8E4",
    onTertiaryContainer: "#31111D",

    // Error colors
    error: "#BA1A1A",
    onError: "#FFFFFF",
    errorContainer: "#FFDAD6",
    onErrorContainer: "#410002",

    // Surface colors
    surface: "#FEF7FF",
    onSurface: "#1C1B1F",
    surfaceVariant: "#E7E0EC",
    onSurfaceVariant: "#49454F",

    // Other colors
    outline: "#79747E",
    outlineVariant: "#918B95",
    shadow: "#000000",
    scrim: "#000000",
    inverseSurface: "#313033",
    onInverseSurface: "#F4EFF4",
  },
};
