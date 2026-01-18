import type { NubaseFrontendConfig } from "@nubase/frontend";
import { defaultKeybindings, resourceLink } from "@nubase/frontend";
import { Home, TicketIcon, UsersIcon } from "lucide-react";
import { apiEndpoints } from "schema";
import { __PROJECT_NAME_PASCAL__AuthController } from "./auth/__PROJECT_NAME_PASCAL__AuthController";
import { analyticsDashboard } from "./dashboards/analytics";
import { ticketResource } from "./resources/ticket";
import { userResource } from "./resources/user";

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
	keybindings: defaultKeybindings.extend(),
	apiBaseUrl: apiBaseUrl,
	apiEndpoints,
	themeIds: ["dark", "light"],
	defaultThemeId: "dark",
	authentication: authController,
	publicRoutes: ["/signin"],
	dashboards: {
		[analyticsDashboard.id]: analyticsDashboard,
	},
};
