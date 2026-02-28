// @nubase/sdk/config — configuration for nubase app projects

export interface NubaseConfig {
  output?: {
    typesDir?: string;
  };
  app?: {
    entry?: string;
  };
}

/**
 * Define the configuration for a Nubase app project.
 * Used in `nubase.config.ts` at the root of the app project.
 *
 * @example
 * ```ts
 * import { defineConfig } from "@nubase/sdk/config";
 *
 * export default defineConfig({
 *   output: { typesDir: ".nubase/types" },
 *   app: { entry: "src/index.ts" },
 * });
 * ```
 */
export function defineConfig(config: NubaseConfig): NubaseConfig {
  return config;
}
