import { dark } from "./dark";
import { darkhc } from "./darkhc";
import { light } from "./light";
import { lighthc } from "./lighthc";

export const themeMap = {
  light: light,
  dark: dark,
  darkhc: darkhc,
  lighthc: lighthc,
} as const;

export type AvailableThemeId = keyof typeof themeMap;
