import type { NubaseFrontendConfig } from "@nubase/frontend";
import {
  commands,
  createCommandAction,
  defaultKeybindings,
  resourceLink,
} from "@nubase/frontend";
import { Home, Plus, TicketIcon, Users2, UsersIcon } from "lucide-react";
import { apiEndpoints } from "../common";
import { QuestlogAuthController } from "./auth/QuestlogAuthController";
import { analyticsDashboard } from "./dashboards/analytics";
import { teamResource } from "./resources/team-resource";
import { ticketResource } from "./resources/ticket-resource";
import { userResource } from "./resources/user-resource";

const apiBaseUrl = "/api";

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
    {
      id: "teams",
      icon: Users2,
      label: "Teams",
      href: resourceLink(teamResource, "search"),
    },
  ],
  resources: {
    [ticketResource.id]: ticketResource,
    [userResource.id]: userResource,
    [teamResource.id]: teamResource,
  },
  globalActions: [
    createCommandAction(
      { id: "create", label: "Create", icon: Plus },
      commands.workbenchOpenResourceOperationInDrawer,
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
  homeScreen: {
    tagline: "Track quests, tickets, and your team in one place.",
    description:
      "Sign in to continue, or create a new organization to get started.",
  },
};
