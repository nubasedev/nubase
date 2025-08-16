import type { Keybinding } from "../commands/types";
import type { TreeNavigatorItem } from "../components/navigation/searchable-tree-navigator/TreeNavigatorItem";
import type { GlobalActionsConfig } from "./global-action";
import type { ResourceDescriptor } from "./resource";

export type NubaseFrontendConfig<TApiEndpoints = any> = {
  appName: string;
  mainMenu: TreeNavigatorItem[];
  /**
   * Maps a resource-id to a resource descriptor configuration.
   * Resources define all available operations (create, view, edit, etc.) for entities.
   */
  resources: Record<string, ResourceDescriptor<any>>;
  /**
   * Global actions that appear in the top bar.
   * Actions execute commands with optional parameters and support separators for grouping.
   */
  globalActions?: GlobalActionsConfig;
  /**
   * If set, this will be used as the base URL for all HTTP requests.
   * If not set, only full URLs will be used in HTTP requests.
   */
  apiBaseUrl?: string;
  /**
   * API endpoints definition for type-safe client generation.
   * The framework will automatically create a typed API client from these endpoints.
   * Supports nested structure like: { tickets: { createTicket: schema, ... }, users: { ... } }
   */
  apiEndpoints?: TApiEndpoints;
  /**
   * Custom keybindings for the application.
   * If not provided, default keybindings will be used.
   * Use defaultKeybindings.extend() to extend defaults with custom bindings.
   */
  keybindings?: Keybinding[];
  themeIds?: string[];
  defaultThemeId?: "light" | "dark";
};
