import type { NubaseFrontendConfig } from "@nubase/react/config/config";
import type { NavItem } from "@nubase/react/config/types";

export const config: NubaseFrontendConfig = {
  appName: "Ticket",
  mainMenu: [
    {
      id: "home",
      label: "Home",
      icon: "home",
      href: "/",
      children: [],
    } satisfies NavItem,
  ],
};
