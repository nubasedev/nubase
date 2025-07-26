import type { ReactNode } from "react";
import type { ModalProps } from "../components/floating/modal/Modal";
import type { NubaseFrontendConfig } from "../config/nubase-frontend-config";
import type { NubaseContextData } from "../context/types";

export type { NubaseContextData };

export interface CommandDefinition {
  id: string;
  name: string;
  icon?: ReactNode;
  execute: (
    context: NubaseContextData,
    args?: Record<string, unknown>,
  ) => void | Promise<void>;
}

export interface Keybinding {
  key: string | string[];
  command: string;
  args?: Record<string, unknown>;
}

export interface CommandRegistry {
  register: (command: CommandDefinition) => void;
  execute: (commandId: string, args?: Record<string, unknown>) => Promise<void>;
  getCommand: (commandId: string) => CommandDefinition | undefined;
  getAllCommands: () => CommandDefinition[];
}
