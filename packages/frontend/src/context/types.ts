import type { AnyRouter } from "@tanstack/react-router";
import type { CommandRegistry, Keybinding } from "../commands/types";
import type { UseModalResult } from "../components/floating/modal";
import type { NubaseFrontendConfig } from "../config/nubase-frontend-config";
import type { TypedApiClientFromEndpoints } from "../http/api-client-factory";
import type { NubaseTheme } from "../theming/theme";

export interface NubaseContextData<TApiEndpoints = any> {
  config: NubaseFrontendConfig<TApiEndpoints>;
  commands: CommandRegistry;
  keybindings: Keybinding[];
  /**
   * Typed HTTP client instance created from the configured API endpoints.
   * This is the client that views should use for type-safe API calls.
   */
  http: TypedApiClientFromEndpoints<TApiEndpoints>;
  modal: UseModalResult;
  theming: {
    themeIds: string[];
    themeMap: Record<string, NubaseTheme>;
    activeThemeId: string;
    setActiveThemeId: (themeId: string) => void;
  };
  router: AnyRouter;
}
