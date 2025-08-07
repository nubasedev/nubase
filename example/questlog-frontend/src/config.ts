import type { NubaseFrontendConfig } from "@nubase/frontend";
import { apiEndpoints } from "questlog-schema";
import { mainMenu } from "../main-menu";
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
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:3001",
  apiEndpoints: apiEndpoints,
  themeIds: [
    "dark",
    "darkhc",
    "darkblue",
    "darkterminal",
    "light",
    "lightereader",
    "lighthc",
  ],
  defaultThemeId: "dark",
};
