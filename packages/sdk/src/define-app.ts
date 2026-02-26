import type { AppDefinition } from "./types/app.js";
import type { EntityMap } from "./types/entity.js";

/**
 * Define a Nubase application extension.
 *
 * The generic parameter `TEntities` is typically the generated `NubaseEntities`
 * type from `.nubase/types/`, created by `nubase pull`. It provides full
 * type-safety for hook keys, validation fields, database queries, and more.
 *
 * @example
 * ```ts
 * import { defineApp } from "@nubase/sdk";
 * import type { NubaseEntities } from "../.nubase/types";
 *
 * export default defineApp<NubaseEntities>({
 *   hooks: {
 *     "ticket:before-create": async (ctx) => {
 *       ctx.log("Creating ticket:", ctx.data.title);
 *     },
 *   },
 * });
 * ```
 */
export function defineApp<TEntities extends EntityMap>(
  config: AppDefinition<TEntities>,
): AppDefinition<TEntities> {
  return config;
}
