import type { NubaseTheme } from "../../theme";

export const draculaTheme: NubaseTheme = {
  name: "Dracula",
  type: "dark",
  id: "dracula",
  colors: {
    // Primary colors - using Dracula green as primary
    primary: "#50FA7B",
    onPrimary: "#282A36",
    primaryContainer: "#006D3E",
    onPrimaryContainer: "#F8F8F2",

    // Secondary colors - using Dracula orange
    secondary: "#FFB86C",
    onSecondary: "#282A36",
    secondaryContainer: "#945F25",
    onSecondaryContainer: "#F8F8F2",

    // Tertiary colors - using Dracula purple
    tertiary: "#BD93F9",
    onTertiary: "#282A36",
    tertiaryContainer: "#6F4BB0",
    onTertiaryContainer: "#F8F8F2",

    // Error colors - using Dracula red
    error: "#FF5555",
    onError: "#1C1C1C",
    errorContainer: "#CC2222",
    onErrorContainer: "#F8F8F2",

    // Surface colors - using Dracula background variants
    surface: "#282A36",
    onSurface: "#F8F8F2",
    surfaceVariant: "#44475A",
    onSurfaceVariant: "#F8F8F2",

    // Other colors
    outline: "#8D97CC",
    outlineVariant: "#707590",
    shadow: "#000000",
    scrim: "#000000",
    inverseSurface: "#F8F8F2",
    onInverseSurface: "#282A36",
  },
};
