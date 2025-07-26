import type { NubaseFrontendConfig } from "@nubase/react";
import { mainMenu } from "./main-menu";
import { createTicketView } from "./views/create-ticket";

export const config: NubaseFrontendConfig = {
  appName: "Questlog",
  mainMenu: mainMenu,
  views: {
    [createTicketView.id]: createTicketView,
  },
  apiBaseUrl: "http://localhost:3001",
  themeIds: ["light", "dark", "darkhc", "lighthc"],
  defaultThemeId: "dark",
};
