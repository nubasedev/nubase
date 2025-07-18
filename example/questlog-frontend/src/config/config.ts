import type { NavItem } from "@nubase/core";

export const config = {
  appName: "Ticket",
  mainMenu: [
    {
      id: "home",
      label: "Home",
      href: "/",
      children: [],
    } satisfies NavItem,
  ],
};
