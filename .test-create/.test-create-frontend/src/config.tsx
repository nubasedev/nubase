import {
	type NubaseFrontendConfig,
	defaultKeybindings,
	resourceLink,
} from "@nubase/frontend";
import { apiEndpoints } from ".test-create-schema";
import { .testCreateAuthController } from "./auth/.testCreateAuthController";
import { ticketResource } from "./resources/ticket";

// Icons (inline SVG from Tabler Icons)
const HomeIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="20"
		height="20"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M5 12l-2 0l9 -9l9 9l-2 0" />
		<path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" />
		<path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" />
	</svg>
);

const TicketIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="20"
		height="20"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M15 5l0 2" />
		<path d="M15 11l0 2" />
		<path d="M15 17l0 2" />
		<path d="M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-3a2 2 0 0 0 0 -4v-3a2 2 0 0 1 2 -2" />
	</svg>
);

const authController = new .testCreateAuthController();

export const config: NubaseFrontendConfig<typeof apiEndpoints> = {
	appName: ".testCreate",
	mainMenu: [
		{
			id: "home",
			icon: HomeIcon,
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
	keybindings: defaultKeybindings,
	apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:3001",
	apiEndpoints,
	themeIds: ["dark", "light"],
	defaultThemeId: "dark",
	authentication: authController,
	publicRoutes: ["/signin"],
};
