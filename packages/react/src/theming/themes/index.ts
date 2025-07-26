import { darkTheme } from "./dark/darkTheme";
import { draculaTheme } from "./dracula/draculaTheme";
import { lightTheme } from "./light/lightTheme";

export const themeMap = {
  light: lightTheme,
  dark: darkTheme,
  dracula: draculaTheme,
} as const;

export type AvailableThemeId = keyof typeof themeMap;
