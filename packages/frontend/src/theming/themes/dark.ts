import type { NubaseTheme } from "../theme";

export const dark: NubaseTheme = {
  name: "Dark",
  type: "dark",
  id: "dark",
  colors: {
    // Base colors
    background: "oklch(0.145 0 0)",
    // Using rgb for foreground to fix 1Password autofill detection (it fails with oklch)
    foreground: "#fafafa",

    // Card colors
    card: "oklch(0.205 0 0)",
    cardForeground: "oklch(0.985 0 0)",

    // Popover colors
    popover: "oklch(0.205 0 0)",
    popoverForeground: "oklch(0.985 0 0)",

    // Primary colors
    primary: "oklch(0.922 0 0)",
    primaryForeground: "oklch(0.205 0 0)",

    // Secondary colors
    secondary: "oklch(0.269 0 0)",
    secondaryForeground: "oklch(0.985 0 0)",

    // Muted colors
    muted: "oklch(0.269 0 0)",
    mutedForeground: "oklch(0.708 0 0)",

    // Accent colors
    accent: "oklch(0.269 0 0)",
    accentForeground: "oklch(0.985 0 0)",

    // Destructive colors
    destructive: "oklch(0.704 0.191 22.216)",
    destructiveForeground: "oklch(0.985 0 0)",

    // Border and input colors
    border: "oklch(1 0 0 / 10%)",
    input: "oklch(1 0 0 / 15%)",
    ring: "oklch(0.556 0 0)",

    // Chart colors
    chart1: "oklch(0.488 0.243 264.376)",
    chart2: "oklch(0.696 0.17 162.48)",
    chart3: "oklch(0.769 0.188 70.08)",
    chart4: "oklch(0.627 0.265 303.9)",
    chart5: "oklch(0.645 0.246 16.439)",

    // Sidebar colors
    sidebar: "oklch(0.205 0 0)",
    sidebarForeground: "oklch(0.985 0 0)",
    sidebarPrimary: "oklch(0.488 0.243 264.376)",
    sidebarPrimaryForeground: "oklch(0.985 0 0)",
    sidebarAccent: "oklch(0.269 0 0)",
    sidebarAccentForeground: "oklch(0.985 0 0)",
    sidebarBorder: "oklch(1 0 0 / 10%)",
    sidebarRing: "oklch(0.556 0 0)",
  },
};
