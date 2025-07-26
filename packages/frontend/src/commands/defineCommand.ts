import type { BaseSchema } from "@nubase/core";
import type { TypedCommandDefinition } from "./types";

/**
 * Factory function for creating type-safe command definitions.
 *
 * This function provides full TypeScript type inference for command arguments
 * based on the provided schema. Use this instead of directly creating
 * TypedCommandDefinition objects for better type safety.
 *
 * @param definition - The command definition with optional args schema
 * @returns A typed command definition with inferred argument types
 *
 * @example
 * ```typescript
 * // Command with no arguments
 * const simpleCommand = defineCommand({
 *   id: "example.simple",
 *   name: "Simple Command",
 *   execute: (context) => {
 *     // context is typed, args is undefined
 *   },
 * });
 *
 * // Command with typed arguments
 * const typedCommand = defineCommand({
 *   id: "example.typed",
 *   name: "Typed Command",
 *   argsSchema: nu.object({
 *     resourceId: nu.string(),
 *     count: nu.number().optional(),
 *   }),
 *   execute: (context, args) => {
 *     // args is typed as { resourceId: string; count?: number | undefined }
 *     console.log(args.resourceId); // Type-safe access
 *   },
 * });
 * ```
 */
export function createCommand<TArgsSchema extends BaseSchema<any> | undefined>(
  definition: TypedCommandDefinition<TArgsSchema>,
): TypedCommandDefinition<TArgsSchema> {
  return definition;
}
