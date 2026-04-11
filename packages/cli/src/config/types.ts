export interface EnvironmentConfig {
  url: string;
}

export interface DataLayerConfig {
  /**
   * Directory containing `.sql` files for `nubase data-layer generate`.
   * Relative to the app root (the parent of the `nubase/` config folder).
   * Default: `"src/backend/data-layer"`.
   */
  dir?: string;
}

export interface NubaseConfig {
  environments: Record<string, EnvironmentConfig>;
  defaultEnvironment?: string;
  schemas?: string[];
  dataLayer?: DataLayerConfig;
}

export interface ResolvedConfig {
  config: NubaseConfig;
  projectRoot: string;
  migrationsDir: string;
  snapshotsDir: string;
  environmentName: string;
  environment: EnvironmentConfig;
}
