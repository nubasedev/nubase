export interface EnvironmentConfig {
  url: string;
}

export interface NubaseConfig {
  environments: Record<string, EnvironmentConfig>;
  defaultEnvironment?: string;
  schemas?: string[];
}

export interface ResolvedConfig {
  config: NubaseConfig;
  projectRoot: string;
  migrationsDir: string;
  snapshotsDir: string;
  environmentName: string;
  environment: EnvironmentConfig;
}
