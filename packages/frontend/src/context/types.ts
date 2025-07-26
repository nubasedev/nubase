import type { Infer, ObjectSchema } from "@nubase/core";
import type { QueryClient } from "@tanstack/react-query";
import type { AnyRouter } from "@tanstack/react-router";
import type { ResourceActionsExecutor } from "../actions/ResourceActionsExecutor";
import type { CommandRegistry, Keybinding } from "../commands/types";
import type { UseDialogResult } from "../components/floating/dialog";
import type { UseModalResult } from "../components/floating/modal";
import type { NubaseFrontendConfig } from "../config/nubase-frontend-config";
import type { TypedApiClientFromEndpoints } from "../http/api-client-factory";
import type { NavigationHistoryTracker } from "../navigation/navigation-history-tracker";
import type { NubaseTheme } from "../theming/theme";

export interface NubaseContextData<
  TApiEndpoints = any,
  TParamsSchema extends ObjectSchema<any> | undefined = undefined,
> {
  config: NubaseFrontendConfig<TApiEndpoints>;
  commands: CommandRegistry;
  resourceActions: ResourceActionsExecutor;
  keybindings: Keybinding[];
  /**
   * Typed HTTP client instance created from the configured API endpoints.
   * This is the client that views should use for type-safe API calls.
   */
  http: TypedApiClientFromEndpoints<TApiEndpoints>;
  modal: UseModalResult;
  /**
   * Dialog provider for confirmation dialogs and alerts.
   */
  dialog: UseDialogResult;
  /**
   * React Query client for cache management and query invalidation.
   */
  queryClient: QueryClient;
  theming: {
    themeIds: string[];
    themeMap: Record<string, NubaseTheme>;
    activeThemeId: string;
    setActiveThemeId: (themeId: string) => void;
  };
  router: AnyRouter;
  /**
   * Navigation history tracker for tracking and accessing route history.
   */
  navigationHistory: NavigationHistoryTracker;
  /**
   * URL parameters extracted and validated against the view's schemaParams.
   * Only present when the view defines a schemaParams.
   */
  params: TParamsSchema extends ObjectSchema<any>
    ? Infer<TParamsSchema>
    : undefined;
}
