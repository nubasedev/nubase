import type { NubaseFrontendConfig } from "@nubase/frontend";
import { apiEndpoints } from "questlog-schema";
import { mainMenu } from "./main-menu";
import { ticketResource } from "./resources/ticket";
import { createTicketView } from "./views/create-ticket";

export const config: NubaseFrontendConfig<typeof apiEndpoints> = {
  appName: "Questlog",
  mainMenu: mainMenu,
  views: {
    [createTicketView.id]: createTicketView,
  },
  resources: {
    [ticketResource.id]: ticketResource,
  },
  apiBaseUrl: "http://localhost:3001",
  apiEndpoints: apiEndpoints,
  themeIds: ["light", "dark", "darkhc", "lighthc"],
  defaultThemeId: "dark",
};
