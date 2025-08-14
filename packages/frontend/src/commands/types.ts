import type { BaseSchema, Infer } from "@nubase/core";
import type { ReactNode } from "react";
import type { NubaseContextData } from "../context/types";

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
  icon?: ReactNode;
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

export interface Keybinding {
  key: string | string[];
  command: string;
  args?: Record<string, unknown>;
}

export interface CommandRegistry {
  register: (command: TypedCommandDefinition<any>) => void;
  execute: (commandId: string, args?: unknown) => Promise<void>;
  getCommand: (commandId: string) => TypedCommandDefinition<any> | undefined;
  getAllCommands: () => TypedCommandDefinition<any>[];
}
