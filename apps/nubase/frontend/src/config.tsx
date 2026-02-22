import type { NubaseFrontendConfig } from "@nubase/frontend";
import {
  commands,
  createCommandAction,
  defaultKeybindings,
  resourceLink,
} from "@nubase/frontend";
import { Home, Plus, TicketIcon, UsersIcon } from "lucide-react";
import { apiEndpoints } from "questlog-schema";
import { QuestlogAuthController } from "./auth/QuestlogAuthController";
import { analyticsDashboard } from "./dashboards/analytics";
import { ticketResource } from "./resources/ticket";
import { userResource } from "./resources/user";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

// Preserve auth controller across HMR to prevent losing authentication state during development
const authController: QuestlogAuthController =
  (import.meta.hot?.data?.authController as QuestlogAuthController) ??
  new QuestlogAuthController(apiBaseUrl);

// Store auth controller in HMR data so it survives hot reloads
if (import.meta.hot) {
  import.meta.hot.data.authController = authController;
}

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
    {
      id: "users",
      icon: UsersIcon,
      label: "Users",
      href: resourceLink(userResource, "search"),
    },
  ],
  resources: {
    [ticketResource.id]: ticketResource,
    [userResource.id]: userResource,
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
