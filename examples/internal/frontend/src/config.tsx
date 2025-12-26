import type { NubaseFrontendConfig } from "@nubase/frontend";
import {
  commands,
  createCommandAction,
  defaultKeybindings,
  resourceLink,
} from "@nubase/frontend";
import { Home, Plus, TicketIcon } from "lucide-react";
import { apiEndpoints } from "questlog-schema";
import { QuestlogAuthController } from "./auth/QuestlogAuthController";
import { analyticsDashboard } from "./dashboards/analytics";
import { ticketResource } from "./resources/ticket";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
const authController = new QuestlogAuthController(apiBaseUrl);

export const config: NubaseFrontendConfig<typeof apiEndpoints> = {
  appName: "Questlog",
  mainMenu: [
    {
      id: "home",
      icon: Home,
      label: "Home",
      href: "/",
    },
    {
      id: "tickets",
      icon: TicketIcon,
      label: "Tickets",
      href: resourceLink(ticketResource, "search"),
    },
  ],
  resources: {
    [ticketResource.id]: ticketResource,
  },
  globalActions: [
    createCommandAction(
      { id: "create", label: "Create", icon: Plus },
      commands.workbenchOpenResourceOperation,
      { operation: "create" },
    ),
  ],
  keybindings: defaultKeybindings.extend({
    add: [
      {
        key: ["meta+/", "ctrl+/"],
        action: createCommandAction(
          { id: "toggle-theme" },
          commands.workbenchSetTheme,
        ),
      },
    ],
  }),
  apiBaseUrl: apiBaseUrl,
  apiEndpoints: apiEndpoints,
  themeIds: ["dark", "light", "dracula", "terminal"],
  defaultThemeId: "dark",
  authentication: authController,
  publicRoutes: ["/signin"],
  dashboards: {
    [analyticsDashboard.id]: analyticsDashboard,
  },
};
