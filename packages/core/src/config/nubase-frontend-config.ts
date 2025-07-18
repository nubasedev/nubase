import type { NavItem } from "./nav-item";
import type { View } from "./view";

export type NubaseFrontendConfig = {
  appName: string;
  mainMenu: NavItem[];
  /**
   * Maps a view-id to a view configuration.
   */
  views: Record<string, View>;
};
