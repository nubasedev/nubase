import { dark } from "./dark";
import { light } from "./light";

export const themeMap = {
  light: light,
  dark: dark,
} as const;

export type AvailableThemeId = keyof typeof themeMap;
