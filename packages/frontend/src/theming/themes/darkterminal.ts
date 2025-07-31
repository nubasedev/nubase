import type { NubaseTheme } from "../theme";

export const darkterminal: NubaseTheme = {
  name: "Dark Terminal",
  type: "dark",
  id: "darkterminal",
  colors: {
    // Primary colors - Bright Matrix green
    primary: "#00ff00",
    onPrimary: "#000000",
    primaryContainer: "#003300",
    onPrimaryContainer: "#39ff14",

    // Secondary colors - Dark green tones
    secondary: "#00cc00",
    onSecondary: "#000000",
    secondaryContainer: "#004400",
    onSecondaryContainer: "#00ff41",

    // Tertiary colors - Electric green accent
    tertiary: "#39ff14",
    onTertiary: "#000000",
    tertiaryContainer: "#001100",
    onTertiaryContainer: "#00ff00",

    // Error colors - Bright red for contrast
    error: "#ff3333",
    onError: "#000000",
    errorContainer: "#330000",
    onErrorContainer: "#ff6666",

    // Surface colors - Deep black Matrix aesthetic
    surface: "#000000",
    onSurface: "#00ff00",
    surfaceVariant: "#0d1117",
    onSurfaceVariant: "#39ff14",

    // Other colors
    outline: "#004400",
    outlineVariant: "#002200",
    shadow: "#000000",
    scrim: "#000000",
    inverseSurface: "#00ff00",
    onInverseSurface: "#000000",
  },
};
