import { withThemeByDataAttribute } from "@storybook/addon-themes";
import type { Preview } from "@storybook/react-vite";
import "../src/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { ModalProvider } from "../src/components/floating/modal";
import {
  ToastContainer,
  ToastProvider,
} from "../src/components/floating/toast";
import { NubaseContextProvider } from "../src/components/nubase-app/NubaseContextProvider";
import type { NubaseContextData } from "../src/context/types";
import {
  defaultNotificationRules,
  eventManager,
  setGlobalEventEmitter,
} from "../src/events";
import { injectThemeVariables } from "../src/theming/runtime-theme-generator";
import { dark } from "../src/theming/themes/dark";
import { light } from "../src/theming/themes/light";

// Inject theme CSS variables globally for Storybook
injectThemeVariables([light, dark]);

// Initialize event system for Storybook
eventManager.setNotificationRules(defaultNotificationRules);
setGlobalEventEmitter(eventManager.emit.bind(eventManager));

// Minimal NubaseContext stub so components that read it via useNubaseContext
// (e.g. LookupSelectFilter) don't throw inside stories. Stories that need
// a real backend or a real typed client should provide their own context.
const storybookQueryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, staleTime: Number.POSITIVE_INFINITY },
  },
});

const storybookHttp = new Proxy(
  {},
  {
    get(_target, endpointName: string) {
      return async () => {
        console.warn(
          `[storybook] api call "${endpointName}" not implemented in the stub context`,
        );
        return undefined;
      };
    },
  },
);

// Intentionally cast — the stub only provides what stories actually touch.
const storybookNubaseContext = {
  config: { appName: "Storybook" },
  commands: { register: () => {}, unregister: () => {}, getAll: () => [] },
  resourceActions: {},
  keybindings: [],
  http: storybookHttp,
  modal: undefined,
  dialog: undefined,
  queryClient: storybookQueryClient,
  theming: {
    themeIds: ["light", "dark"],
    themeMap: { light, dark },
    activeThemeId: "dark",
    setActiveThemeId: () => {},
  },
  router: undefined,
  navigationHistory: {
    getCurrent: () => null,
    push: () => {},
    replace: () => {},
    back: () => {},
  },
  params: undefined,
  authentication: null,
  workspace: null,
} as unknown as NubaseContextData<unknown>;

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      disable: true,
    },
    themes: {
      default: "dark",
      list: [
        { name: "Light", dataAttribute: "light", color: "#ffffff" },
        { name: "Dark", dataAttribute: "dark", color: "#1a1a1a" },
      ],
    },
  },
  decorators: [
    withThemeByDataAttribute({
      themes: {
        light: "light",
        dark: "dark",
      },
      defaultTheme: "dark",
      attributeName: "data-theme",
    }),
    (Story) => (
      <ToastProvider>
        <Story />
        <ToastContainer />
      </ToastProvider>
    ),
    (Story) => (
      <ModalProvider>
        <Story />
      </ModalProvider>
    ),
    (Story) => (
      <QueryClientProvider client={storybookQueryClient}>
        <NubaseContextProvider context={storybookNubaseContext}>
          <Story />
        </NubaseContextProvider>
      </QueryClientProvider>
    ),
    (Story) => (
      <RouterProvider
        router={createRouter({
          history: createMemoryHistory(),
          routeTree: createRootRoute({
            component: Story,
          }),
        })}
      />
    ),
  ],
};

export default preview;
