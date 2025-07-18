import type { NubaseFrontendConfig } from "@repo/react/config/config";
import type { NavItem } from "@repo/react/config/types";

export const config = {
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
