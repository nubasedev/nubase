import type { NubaseTheme } from "../theme";

export const lightereader: NubaseTheme = {
  name: "Light e-Reader",
  type: "light",
  id: "lightereader",
  colors: {
    // Primary colors - Warm blue accent like Kindle highlights
    primary: "#007BB8",
    onPrimary: "#FFFFFF",
    primaryContainer: "#E6F3FF",
    onPrimaryContainer: "#003D5C",

    // Secondary colors - Soft warm grays
    secondary: "#6B6B6B",
    onSecondary: "#FFFFFF",
    secondaryContainer: "#F0F0F0",
    onSecondaryContainer: "#1F1F1F",

    // Tertiary colors - Kindle orange for accents
    tertiary: "#FF9500",
    onTertiary: "#FFFFFF",
    tertiaryContainer: "#FFF4E6",
    onTertiaryContainer: "#CC7700",

    // Error colors - Soft red for light reading
    error: "#D32F2F",
    onError: "#FFFFFF",
    errorContainer: "#FFEBEE",
    onErrorContainer: "#B71C1C",

    // Surface colors - Warm paper-like tones
    surface: "#FFFEF7",
    onSurface: "#2C2C2C",
    surfaceVariant: "#F7F5F3",
    onSurfaceVariant: "#5C5C5C",

    // Other colors - Minimal and clean
    outline: "#CCCCCC",
    outlineVariant: "#E8E8E8",
    shadow: "#000000",
    scrim: "#000000",
    inverseSurface: "#2C2C2C",
    onInverseSurface: "#FFFEF7",
  },
};
