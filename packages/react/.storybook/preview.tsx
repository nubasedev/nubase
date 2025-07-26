import { withThemeByDataAttribute } from "@storybook/addon-themes";
import type { Preview } from "@storybook/react-vite";
import "../src/styles.css";
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from "@tanstack/react-router";
import {
  ToastContainer,
  ToastProvider,
} from "../src/components/floating/toast";
import { injectThemeVariables } from "../src/theming/runtime-theme-generator";
import { darkTheme } from "../src/theming/themes/dark/darkTheme";
import { lightTheme } from "../src/theming/themes/light/lightTheme";

// Inject theme CSS variables globally for Storybook
injectThemeVariables([lightTheme, darkTheme]);

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
