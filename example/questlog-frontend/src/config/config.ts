import type { NubaseFrontendConfig } from "@nubase/core";
import { mainMenu } from "./main-menu";
import { createTicketView } from "./views/create-ticket";

export const config: NubaseFrontendConfig = {
  appName: "Questlog",
  mainMenu: mainMenu,
  views: {
    [createTicketView.id]: createTicketView,
  },
};
