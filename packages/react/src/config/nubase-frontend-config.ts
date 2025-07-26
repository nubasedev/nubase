import type { TreeNavigatorItem } from "../components/navigation/searchable-tree-navigator/TreeNavigatorItem";
import type { View } from "./view";

export type NubaseFrontendConfig = {
  appName: string;
  mainMenu: TreeNavigatorItem[];
  /**
   * Maps a view-id to a view configuration.
   */
  views: Record<string, View>;
  /**
   * If set, this will be used as the base URL for all HTTP requests.
   * If not set, only full URLs will be used in HTTP requests.
   */
  apiBaseUrl?: string;
  themeIds?: string[];
  defaultThemeId?: "light" | "dark";
};
