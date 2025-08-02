import { commandRegistry } from "../../commands";
import { workbenchOpenResource } from "../../commands/definitions/workbench.openResource";
import { workbenchOpenView } from "../../commands/definitions/workbench.openView";
import { workbenchOpenViewInModal } from "../../commands/definitions/workbench.openViewInModal";
import { workbenchRunCommand } from "../../commands/definitions/workbench.runCommand";
import { workbenchSetTheme } from "../../commands/definitions/workbench.setTheme";
import type { NubaseFrontendConfig } from "../../config/nubase-frontend-config";
import type { HttpClient } from "../../http/http-client";
import type { NubaseTheme } from "../../theming/theme";
import { themeMap } from "../../theming/themes";
import { initializeStyles } from "./initializeStyles";

export interface InitializeNubaseAppOptions {
  config: NubaseFrontendConfig;
  httpClient: HttpClient;
}

export interface NubaseInitializationData {
  config: NubaseFrontendConfig;
  themeIds: string[];
  themeMap: Record<string, NubaseTheme>;
  defaultThemeId: string;
}

/**
 * Initializes the Nubase app with all required services and themes
 */
export async function initializeNubaseApp({
  config,
}: InitializeNubaseAppOptions): Promise<NubaseInitializationData> {
  console.info("Initializing Nubase app...");

  // Get theme configuration
  const themeIds = config.themeIds || ["light", "dark"];
  const defaultThemeId = config.defaultThemeId || "dark";

  // Filter available themes based on config
  const themesToBeImported = themeIds
    .map((id) => themeMap[id as keyof typeof themeMap])
    .filter((theme): theme is NubaseTheme => theme !== undefined);

  // Initialize styles with the loaded themes (one-time injection)
  await initializeStyles(themesToBeImported);

  // Register default commands (one-time registration)
  commandRegistry.register(workbenchRunCommand);
  commandRegistry.register(workbenchSetTheme);
  commandRegistry.register(workbenchOpenView);
  commandRegistry.register(workbenchOpenViewInModal);
  commandRegistry.register(workbenchOpenResource);

  console.info("Nubase app initialized");

  return {
    config,
    themeIds,
    themeMap,
    defaultThemeId,
  };
}
