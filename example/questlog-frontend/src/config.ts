import type { NubaseFrontendConfig } from "@nubase/frontend";
import { apiEndpoints } from "questlog-schema";
import { mainMenu } from "../main-menu";
import { ticketResource } from "./resources/ticket";
import { createTicketView } from "./views/create-ticket";
import { searchTicketsView } from "./views/search-tickets";

export const config: NubaseFrontendConfig<typeof apiEndpoints> = {
  appName: "Questlog",
  mainMenu: mainMenu,
  views: {
    [createTicketView.id]: createTicketView,
    [searchTicketsView.id]: searchTicketsView,
  },
  resources: {
    [ticketResource.id]: ticketResource,
  },
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:3001",
  apiEndpoints: apiEndpoints,
  themeIds: ["dark", "light"],
  defaultThemeId: "dark",
};
