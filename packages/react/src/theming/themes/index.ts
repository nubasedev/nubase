import { darkTheme } from "./dark/darkTheme";
import { darkHighContrastTheme } from "./darkhc/darkHighContrastTheme";
import { lightTheme } from "./light/lightTheme";
import { lightHighContrastTheme } from "./lighthc/lightHighContrastTheme";

export const themeMap = {
  light: lightTheme,
  dark: darkTheme,
  darkhc: darkHighContrastTheme,
  lighthc: lightHighContrastTheme,
} as const;

export type AvailableThemeId = keyof typeof themeMap;
