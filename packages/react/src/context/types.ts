import type { ReactNode } from "react";
import type { CommandRegistry, Keybinding } from "../commands/types";
import type { ModalProps } from "../components/floating/modal/Modal";
import type { NubaseFrontendConfig } from "../config/nubase-frontend-config";
import type { HttpClient } from "../http/http-client";
import type { NubaseTheme } from "../theming/theme";

export interface NubaseContextData {
  config: NubaseFrontendConfig;
  commands: CommandRegistry;
  keybindings: Keybinding[];
  httpClient: HttpClient;
  modal: {
    openModal: (
      component: ReactNode,
      options?: Omit<ModalProps, "open" | "onClose" | "children"> & {
        onDismiss?: () => void;
      },
    ) => string;
    closeModal: (id?: string) => void;
  };
  theming: {
    themeIds: string[];
    themeMap: Record<string, NubaseTheme>;
    activeThemeId: string;
    setActiveThemeId: (themeId: string) => void;
  };
}
