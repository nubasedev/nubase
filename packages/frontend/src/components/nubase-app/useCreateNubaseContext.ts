import { useCallback, useEffect, useMemo, useState } from "react";
import { commandRegistry } from "../../commands";
import type { NubaseFrontendConfig } from "../../config/nubase-frontend-config";
import type { NubaseContextData } from "../../context/types";
import { HttpClient } from "../../http/http-client";
import {
  createTypedApiClient,
  type ErrorListener,
} from "../../http/typed-api-client";
import { cleanupKeybindings, registerKeybindings } from "../../keybindings";
import { NavigationHistoryTracker } from "../../navigation/navigation-history-tracker";
import { router } from "../../routes/router";
import { useModal } from "../floating/modal";
import { showToast } from "../floating/toast";
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
          showToast(error.message || "An error occurred", "error");
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
      keybindings: [
        {
          key: ["meta+k", "ctrl+k"],
          command: "workbench.runCommand",
          args: {},
        },
        {
          key: ["meta+/", "ctrl+/"],
          command: "workbench.setTheme",
          args: {},
        },
      ],
      http: typedApiClient,
      modal,
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
    };

    return nubaseContextDataInternal;
  }, [
    initializationData,
    modal,
    activeThemeId,
    httpClient,
    navigationHistoryTracker,
  ]);

  // Initialize command system and register keybindings when nubaseContextData is available
  useEffect(() => {
    if (nubaseContextData) {
      // Set command registry context
      commandRegistry.setContext(nubaseContextData);

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
