import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { resourceActionsExecutor } from "../../actions/ResourceActionsExecutor";
import { commandRegistry } from "../../commands";
import type { NubaseFrontendConfig } from "../../config/nubase-frontend-config";
import type { NubaseContextData } from "../../context/types";
import { HttpClient } from "../../http/http-client";
import {
  createTypedApiClient,
  type ErrorListener,
} from "../../http/typed-api-client";
import {
  cleanupKeybindings,
  defaultKeybindings,
  keybindingManager,
  registerKeybindings,
} from "../../keybindings";
import { NavigationHistoryTracker } from "../../navigation/navigation-history-tracker";
import { router } from "../../routes/router";
import { useDialog } from "../floating/dialog";
import { useModal } from "../floating/modal";
import {
  initializeNubaseApp,
  type NubaseInitializationData,
} from "./initializeNubaseApp";

export interface UseNubaseContextOptions {
  config: NubaseFrontendConfig;
}

export interface UseNubaseContextResult {
  data: NubaseContextData | null;
  isLoading: boolean;
  error: Error | null;
  retry: () => void;
}

/**
 * Hook that manages the initialization of the Nubase app context
 * Handles async theme loading and other initialization tasks
 */
export function useCreateNubaseContext({
  config,
}: UseNubaseContextOptions): UseNubaseContextResult {
  const [initializationData, setInitializationData] =
    useState<NubaseInitializationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [activeThemeId, setActiveThemeId] = useState<string>("");
  const modal = useModal();
  const dialog = useDialog();
  const queryClient = useQueryClient();

  // Create httpClient inside the hook
  const httpClient = useMemo(() => {
    return new HttpClient({
      baseUrl: config.apiBaseUrl,
    });
  }, [config.apiBaseUrl]);

  // Create navigation history tracker
  const navigationHistoryTracker = useMemo(() => {
    return new NavigationHistoryTracker(router);
  }, []);

  const initialize = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const initData = await initializeNubaseApp({ config, httpClient });
      setInitializationData(initData);
      setActiveThemeId(initData.defaultThemeId);
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("Failed to initialize Nubase app");
      setError(error);
      console.error("Failed to initialize Nubase app:", error);
    } finally {
      setIsLoading(false);
    }
  }, [config, httpClient]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Create the mutable, stateful NubaseContextData
  const nubaseContextData = useMemo(() => {
    if (!initializationData) return null;

    // Create typed API client if endpoints are provided
    let typedApiClient: any = httpClient;
    if (initializationData.config.apiEndpoints) {
      try {
        const errorListener: ErrorListener = (error) => {
          console.error("API request failed:", error);
        };

        typedApiClient = createTypedApiClient(
          httpClient,
          initializationData.config.apiEndpoints,
          errorListener,
        );
      } catch (error) {
        console.warn("Failed to create typed API client:", error);
      }
    }

    const nubaseContextDataInternal: NubaseContextData = {
      config: initializationData.config,
      commands: commandRegistry,
      resourceActions: resourceActionsExecutor,
      keybindings:
        initializationData.config.keybindings || defaultKeybindings.get(),
      http: typedApiClient,
      modal,
      dialog,
      queryClient,
      theming: {
        themeIds: initializationData.themeIds,
        themeMap: initializationData.themeMap,
        activeThemeId,
        setActiveThemeId: (themeId: string) => {
          if (initializationData.themeIds.includes(themeId)) {
            setActiveThemeId(themeId);
          } else {
            console.warn(`Theme ID "${themeId}" is not defined in the config.`);
          }
        },
      },
      router,
      navigationHistory: navigationHistoryTracker,
      params: undefined,
      authentication: initializationData.config.authentication || null,
      // Workspace is extracted dynamically from router state when needed
      // Use getWorkspaceFromRouter helper or context.router.state for access
      workspace: null,
    };

    return nubaseContextDataInternal;
  }, [
    initializationData,
    activeThemeId,
    httpClient,
    navigationHistoryTracker,
    modal,
    dialog,
    queryClient,
  ]);

  // Initialize command system and register keybindings when nubaseContextData is available
  useEffect(() => {
    if (nubaseContextData) {
      // Set command registry context
      commandRegistry.setContext(nubaseContextData);

      // Set resource actions executor context
      resourceActionsExecutor.setContext(nubaseContextData);

      // Set keybinding manager context
      keybindingManager.setContext(nubaseContextData);

      // Register keybindings
      registerKeybindings(nubaseContextData.keybindings);
    }
  }, [nubaseContextData]);

  // Update DOM attribute when activeThemeId changes
  useEffect(() => {
    if (activeThemeId) {
      document.documentElement.setAttribute("data-theme", activeThemeId);
    }
  }, [activeThemeId]);

  // Cleanup function to remove theme variables, keybindings, and navigation tracker when unmounting
  useEffect(() => {
    return () => {
      const existingStyle = document.getElementById("nubase-theme-variables");
      if (existingStyle) {
        existingStyle.remove();
      }
      cleanupKeybindings();
      navigationHistoryTracker.dispose();
    };
  }, [navigationHistoryTracker]);

  return {
    data: nubaseContextData,
    isLoading,
    error,
    retry: initialize,
  };
}
