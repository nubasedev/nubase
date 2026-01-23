import type { NubaseTheme } from "../theme";

export const dracula: NubaseTheme = {
  name: "Dracula",
  type: "dark",
  id: "dracula",
  colors: {
    // Base colors - Dracula background and foreground
    background: "oklch(0.15 0.01 249.79)", // #282a36 dark purple-gray
    // Using hex for foreground to fix 1Password autofill detection (it fails with oklch)
    foreground: "#f8f8f2", // light gray

    // Card colors
    card: "oklch(0.18 0.015 249.79)", // #44475a slightly lighter
    cardForeground: "oklch(0.95 0.01 249.79)", // #f8f8f2

    // Popover colors
    popover: "oklch(0.18 0.015 249.79)", // #44475a
    popoverForeground: "oklch(0.95 0.01 249.79)", // #f8f8f2

    // Primary colors - Dracula purple
    primary: "oklch(0.60 0.20 307)", // #bd93f9 purple
    primaryForeground: "oklch(0.15 0.01 249.79)", // dark background

    // Secondary colors - Dracula comment gray
    secondary: "oklch(0.45 0.015 249.79)", // #6272a4 blue-gray
    secondaryForeground: "oklch(0.95 0.01 249.79)", // #f8f8f2

    // Muted colors
    muted: "oklch(0.22 0.015 249.79)", // darker gray
    mutedForeground: "oklch(0.65 0.01 249.79)", // medium gray

    // Accent colors - subtle hover, keeps Dracula feel
    accent: "oklch(0.22 0.02 249.79)", // subtle dark purple-gray for hover states
    accentForeground: "oklch(0.95 0.01 249.79)", // light foreground

    // Destructive colors - Dracula red
    destructive: "oklch(0.60 0.25 25)", // #ff5555 red
    destructiveForeground: "oklch(0.95 0.01 249.79)", // #f8f8f2

    // Border and input colors
    border: "oklch(0.35 0.015 249.79)", // medium gray
    input: "oklch(0.35 0.015 249.79)", // medium gray
    ring: "oklch(0.60 0.20 307)", // purple ring

    // Chart colors - Dracula palette
    chart1: "oklch(0.60 0.20 307)", // #bd93f9 purple
    chart2: "oklch(0.65 0.25 340)", // #ff79c6 pink
    chart3: "oklch(0.70 0.25 162)", // #50fa7b green
    chart4: "oklch(0.75 0.20 60)", // #f1fa8c yellow
    chart5: "oklch(0.65 0.25 25)", // #ff5555 red

    // Sidebar colors
    sidebar: "oklch(0.15 0.01 249.79)", // #282a36 dark background
    sidebarForeground: "oklch(0.95 0.01 249.79)", // #f8f8f2
    sidebarPrimary: "oklch(0.60 0.20 307)", // #bd93f9 purple
    sidebarPrimaryForeground: "oklch(0.15 0.01 249.79)", // dark
    sidebarAccent: "oklch(0.65 0.25 340)", // #ff79c6 pink
    sidebarAccentForeground: "oklch(0.15 0.01 249.79)", // dark
    sidebarBorder: "oklch(0.35 0.015 249.79)", // medium gray
    sidebarRing: "oklch(0.60 0.20 307)", // purple
  },
};
