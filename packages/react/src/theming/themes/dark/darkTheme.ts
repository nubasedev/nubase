import type { NubaseTheme } from "../../theme";

export const darkTheme: NubaseTheme = {
  name: "Dark",
  type: "dark",
  id: "dark",
  colors: {
    // Primary colors
    primary: "#D0BCFF",
    onPrimary: "#381E72",
    primaryContainer: "#4F378B",
    onPrimaryContainer: "#EADDFF",

    // Secondary colors
    secondary: "#CCC2DC",
    onSecondary: "#332D41",
    secondaryContainer: "#4A4458",
    onSecondaryContainer: "#E8DEF8",

    // Tertiary colors
    tertiary: "#EFB8C8",
    onTertiary: "#492532",
    tertiaryContainer: "#633B48",
    onTertiaryContainer: "#FFD8E4",

    // Error colors
    error: "#FFB4AB",
    onError: "#690005",
    errorContainer: "#93000A",
    onErrorContainer: "#FFDAD6",

    // Surface colors
    surface: "#10090D",
    onSurface: "#E6E1E5",
    surfaceVariant: "#49454F",
    onSurfaceVariant: "#CAC4D0",

    // Other colors
    outline: "#928b94",
    outlineVariant: "#635F69",
    shadow: "#000000",
    scrim: "#000000",
    inverseSurface: "#E6E1E5",
    onInverseSurface: "#313033",
  },
};
