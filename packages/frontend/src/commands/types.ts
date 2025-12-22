import type { BaseSchema, Infer } from "@nubase/core";
import type { Action } from "../actions/types";
import type { NubaseContextData } from "../context/types";
import type { IconComponent } from "../menu/types";

export type { NubaseContextData };

/**
 * Type-safe command definition that uses Nubase schemas for argument validation.
 *
 * @template TArgsSchema - The schema type for command arguments, or undefined if no args
 */
export interface TypedCommandDefinition<
  TArgsSchema extends BaseSchema<any> | undefined = undefined,
> {
  id: string;
  name: string;
  /**
   * Icon component (not instantiated) for this command.
   * Used in command palettes, menus, and anywhere the command is displayed.
   */
  icon?: IconComponent;
  /**
   * Optional schema for validating command arguments.
   * If provided, arguments will be validated at runtime.
   */
  argsSchema?: TArgsSchema;
  /**
   * Command execution function with type-safe arguments.
   * Args are typed based on the provided schema.
   */
  execute: (
    context: NubaseContextData,
    args: TArgsSchema extends BaseSchema<any> ? Infer<TArgsSchema> : undefined,
  ) => void | Promise<void>;
}

/**
 * Modern keybinding interface using typed actions.
 * Supports both handler and command actions with full type safety.
 */
export interface ActionKeybinding {
  key: string | string[];
  action: Action;
}

/**
 * Union type supporting both legacy command and modern action keybindings.
 * Provides backward compatibility while enabling type-safe actions.
 */
export type Keybinding =
  | {
      key: string | string[];
      command: string;
      commandArgs?: Record<string, unknown>;
    }
  | ActionKeybinding;

export interface CommandRegistry {
  register: (command: TypedCommandDefinition<any>) => void;
  execute: (commandId: string, args?: unknown) => Promise<void>;
  getCommand: (commandId: string) => TypedCommandDefinition<any> | undefined;
  getAllCommands: () => TypedCommandDefinition<any>[];
}
