import type { NavItem } from "@nubase/react";

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
