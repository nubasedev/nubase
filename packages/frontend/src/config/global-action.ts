import type React from "react";

/**
 * Represents a global action that can be executed from the top bar.
 * Global actions execute commands with optional parameters.
 */
export interface Action {
  id: string;
  label?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  command: string;
  commandArgs?: Record<string, unknown>;
  disabled?: boolean;
}

/**
 * Global actions configuration type that supports separators for grouping.
 */
export type GlobalActionsConfig = (Action | "separator")[];
