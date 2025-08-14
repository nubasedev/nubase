import type { NubaseFrontendConfig } from "@nubase/frontend";
import { Plus } from "lucide-react";
import { apiEndpoints } from "questlog-schema";
import { mainMenu } from "../main-menu";
import { ticketResource } from "./resources/ticket";

export const config: NubaseFrontendConfig<typeof apiEndpoints> = {
  appName: "Questlog",
  mainMenu: mainMenu,
  resources: {
    [ticketResource.id]: ticketResource,
  },
  globalActions: [
    {
      id: "create",
      label: "Create",
      icon: Plus,
      command: "workbench.openResourceOperation",
      commandArgs: { operation: "create" },
    },
  ],
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:3001",
  apiEndpoints: apiEndpoints,
  themeIds: ["dark", "light"],
  defaultThemeId: "dark",
};
