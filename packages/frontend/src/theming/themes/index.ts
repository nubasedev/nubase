import { dark } from "./dark";
import { dracula } from "./dracula";
import { light } from "./light";
import { terminal } from "./terminal";

export const themeMap = {
  light: light,
  dark: dark,
  dracula: dracula,
  terminal: terminal,
} as const;

export type AvailableThemeId = keyof typeof themeMap;
