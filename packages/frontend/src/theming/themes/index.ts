import { dark } from "./dark";
import { darkBlue } from "./darkblue";
import { darkhc } from "./darkhc";
import { darkterminal } from "./darkterminal";
import { light } from "./light";
import { lightereader } from "./lightereader";
import { lighthc } from "./lighthc";

export const themeMap = {
  light: light,
  lightereader: lightereader,
  dark: dark,
  darkblue: darkBlue,
  darkterminal: darkterminal,
  darkhc: darkhc,
  lighthc: lighthc,
} as const;

export type AvailableThemeId = keyof typeof themeMap;
