import type { RequestSchema } from "@nubase/core";
import type { TreeNavigatorItem } from "../components/navigation/searchable-tree-navigator/TreeNavigatorItem";
import type { ResourceDescriptor } from "./resource";
import type { View } from "./view";

export type NubaseFrontendConfig<TApiEndpoints = any> = {
  appName: string;
  mainMenu: TreeNavigatorItem[];
  /**
   * Maps a view-id to a view configuration.
   */
  views: Record<string, View<any, TApiEndpoints>>;
  /**
   * Maps a resource-id to a resource descriptor configuration.
   */
  resources?: Record<string, ResourceDescriptor<any>>;
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
  themeIds?: string[];
  defaultThemeId?: "light" | "dark";
};
