import { useCallback, useEffect, useMemo, useState } from "react";
import { commandRegistry } from "../../commands";
import type { NubaseFrontendConfig } from "../../config/nubase-frontend-config";
import type { NubaseContextData } from "../../context/types";
import type { HttpClient } from "../../http/http-client";
import { cleanupKeybindings, registerKeybindings } from "../../keybindings";
import { useModal } from "../floating/modal/useModal";
import {
  type NubaseInitializationData,
  initializeNubaseApp,
} from "./initializeNubaseApp";

export interface UseNubaseContextOptions {
  config: NubaseFrontendConfig;
  httpClient: HttpClient;
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
  httpClient,
}: UseNubaseContextOptions): UseNubaseContextResult {
  const [initializationData, setInitializationData] =
    useState<NubaseInitializationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [activeThemeId, setActiveThemeId] = useState<string>("");
  const modal = useModal();

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
      httpClient,
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
    };

    return nubaseContextDataInternal;
  }, [initializationData, modal, activeThemeId, httpClient]);

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

  // Cleanup function to remove theme variables and keybindings when unmounting
  useEffect(() => {
    return () => {
      const existingStyle = document.getElementById("nubase-theme-variables");
      if (existingStyle) {
        existingStyle.remove();
      }
      cleanupKeybindings();
    };
  }, []);

  return {
    data: nubaseContextData,
    isLoading,
    error,
    retry: initialize,
  };
}
