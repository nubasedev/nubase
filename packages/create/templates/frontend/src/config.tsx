import type { NubaseFrontendConfig } from "@nubase/frontend";
import { defaultKeybindings, resourceLink } from "@nubase/frontend";
import { Home, TicketIcon } from "lucide-react";
import { apiEndpoints } from "__PROJECT_NAME__-schema";
import { __PROJECT_NAME_PASCAL__AuthController } from "./auth/__PROJECT_NAME_PASCAL__AuthController";
import { ticketResource } from "./resources/ticket";

const apiBaseUrl =
	import.meta.env.VITE_API_BASE_URL || "http://localhost:__BACKEND_PORT__";
const authController = new __PROJECT_NAME_PASCAL__AuthController(apiBaseUrl);

export const config: NubaseFrontendConfig<typeof apiEndpoints> = {
	appName: "__PROJECT_NAME_PASCAL__",
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
	keybindings: defaultKeybindings.extend(),
	apiBaseUrl: apiBaseUrl,
	apiEndpoints,
	themeIds: ["dark", "light"],
	defaultThemeId: "dark",
	authentication: authController,
	publicRoutes: ["/signin"],
};
