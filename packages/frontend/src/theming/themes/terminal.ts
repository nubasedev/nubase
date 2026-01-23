import type { NubaseTheme } from "../theme";

export const terminal: NubaseTheme = {
  name: "Terminal",
  type: "dark",
  id: "terminal",
  colors: {
    // Base colors - Matrix black background with green text
    background: "oklch(0.05 0 0)", // #000000 pure black
    // Using hex for foreground to fix 1Password autofill detection (it fails with oklch)
    foreground: "#00ff00", // bright green

    // Card colors
    card: "oklch(0.10 0.02 136)", // very dark green-tinted
    cardForeground: "oklch(0.80 0.15 136)", // bright green

    // Popover colors
    popover: "oklch(0.08 0.02 136)", // darker green-tinted
    popoverForeground: "oklch(0.80 0.15 136)", // bright green

    // Primary colors - Matrix green
    primary: "oklch(0.75 0.18 136)", // #00cc00 Matrix green
    primaryForeground: "oklch(0.05 0 0)", // black text

    // Secondary colors - darker green
    secondary: "oklch(0.20 0.08 136)", // dark green
    secondaryForeground: "oklch(0.80 0.15 136)", // bright green

    // Muted colors
    muted: "oklch(0.15 0.05 136)", // muted dark green
    mutedForeground: "oklch(0.60 0.12 136)", // muted green

    // Accent colors - subtle hover, keeps terminal feel
    accent: "oklch(0.15 0.05 136)", // subtle dark green for hover states
    accentForeground: "oklch(0.80 0.15 136)", // bright green foreground

    // Destructive colors - Matrix red (error state)
    destructive: "oklch(0.60 0.25 25)", // #ff3333 red
    destructiveForeground: "oklch(0.05 0 0)", // black

    // Border and input colors
    border: "oklch(0.30 0.10 136)", // green border
    input: "oklch(0.25 0.08 136)", // darker green input
    ring: "oklch(0.75 0.18 136)", // Matrix green ring

    // Chart colors - Matrix green variations
    chart1: "oklch(0.75 0.18 136)", // #00cc00 primary green
    chart2: "oklch(0.85 0.20 136)", // #33ff33 bright green
    chart3: "oklch(0.65 0.15 136)", // #009900 darker green
    chart4: "oklch(0.70 0.16 140)", // slight hue shift
    chart5: "oklch(0.80 0.19 132)", // slight hue shift

    // Sidebar colors
    sidebar: "oklch(0.05 0 0)", // pure black
    sidebarForeground: "oklch(0.80 0.15 136)", // bright green
    sidebarPrimary: "oklch(0.75 0.18 136)", // Matrix green
    sidebarPrimaryForeground: "oklch(0.05 0 0)", // black
    sidebarAccent: "oklch(0.85 0.20 136)", // phosphor green
    sidebarAccentForeground: "oklch(0.05 0 0)", // black
    sidebarBorder: "oklch(0.30 0.10 136)", // green border
    sidebarRing: "oklch(0.75 0.18 136)", // Matrix green
  },
};
