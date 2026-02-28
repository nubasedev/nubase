export interface RemoteConfig {
  url: string;
  workspace: string;
  token?: string;
}

export interface RemotesConfig {
  active: string | null;
  remotes: Record<string, RemoteConfig>;
}
