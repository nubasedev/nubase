import type { NubaseTheme } from "../theme";

export const light: NubaseTheme = {
  name: "Light",
  type: "light",
  id: "light",
  colors: {
    // Base colors
    background: "oklch(1 0 0)",
    foreground: "oklch(0.145 0 0)",

    // Card colors
    card: "oklch(1 0 0)",
    cardForeground: "oklch(0.145 0 0)",

    // Popover colors
    popover: "oklch(1 0 0)",
    popoverForeground: "oklch(0.145 0 0)",

    // Primary colors
    primary: "oklch(0.205 0 0)",
    primaryForeground: "oklch(0.985 0 0)",

    // Secondary colors
    secondary: "oklch(0.97 0 0)",
    secondaryForeground: "oklch(0.205 0 0)",

    // Muted colors
    muted: "oklch(0.97 0 0)",
    mutedForeground: "oklch(0.556 0 0)",

    // Accent colors
    accent: "oklch(0.97 0 0)",
    accentForeground: "oklch(0.205 0 0)",

    // Destructive colors
    destructive: "oklch(0.577 0.245 27.325)",
    destructiveForeground: "oklch(0.985 0 0)",

    // Border and input colors
    border: "oklch(0.922 0 0)",
    input: "oklch(0.922 0 0)",
    ring: "oklch(0.708 0 0)",

    // Chart colors
    chart1: "oklch(0.646 0.222 41.116)",
    chart2: "oklch(0.6 0.118 184.704)",
    chart3: "oklch(0.398 0.07 227.392)",
    chart4: "oklch(0.828 0.189 84.429)",
    chart5: "oklch(0.769 0.188 70.08)",

    // Sidebar colors
    sidebar: "oklch(0.985 0 0)",
    sidebarForeground: "oklch(0.145 0 0)",
    sidebarPrimary: "oklch(0.205 0 0)",
    sidebarPrimaryForeground: "oklch(0.985 0 0)",
    sidebarAccent: "oklch(0.97 0 0)",
    sidebarAccentForeground: "oklch(0.205 0 0)",
    sidebarBorder: "oklch(0.922 0 0)",
    sidebarRing: "oklch(0.708 0 0)",
  },
};
