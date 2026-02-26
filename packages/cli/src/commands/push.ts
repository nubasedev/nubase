import { readFileSync } from "node:fs";
import path from "node:path";
import { loadAppConfig } from "../config/load-app-config.js";
import { log } from "../output/logger.js";

interface Manifest {
  hooks: Array<{ hookKey: string; entityName: string; hookType: string }>;
  endpoints: Array<{ method: string; path: string }>;
  actions: Array<{ name: string; entity: string; scope: string }>;
}

/**
 * `nubase push` — bundle app code and deploy to server.
 */
export async function push(): Promise<void> {
  log.step("Loading nubase.config.ts...");
  const resolved = await loadAppConfig();
  const { config, projectRoot, entry } = resolved;

  const entryPath = path.join(projectRoot, entry);

  log.step(`Bundling ${entry}...`);

  // Dynamic import esbuild (peer dependency)
  let esbuild: typeof import("esbuild");
  try {
    esbuild = await import("esbuild");
  } catch {
    throw new Error(
      "esbuild is required for `nubase push`. Install it: npm install -D esbuild",
    );
  }

  const result = await esbuild.build({
    entryPoints: [entryPath],
    bundle: true,
    format: "esm",
    target: "es2022",
    platform: "neutral",
    sourcemap: true,
    write: false,
    external: ["@nubase/sdk"],
    outdir: "out",
  });

  const bundleOutput = result.outputFiles?.find((f) => f.path.endsWith(".js"));
  const sourceMapOutput = result.outputFiles?.find((f) =>
    f.path.endsWith(".js.map"),
  );

  if (!bundleOutput) {
    throw new Error("esbuild produced no output");
  }

  const bundle = bundleOutput.text;
  const sourceMap = sourceMapOutput?.text;

  log.step("Extracting manifest from bundle...");

  // Extract manifest by analyzing the bundle
  const manifest = extractManifest(bundle);

  log.dim(
    `  ${manifest.hooks.length} hook(s), ${manifest.endpoints.length} endpoint(s), ${manifest.actions.length} action(s)`,
  );

  // Load cached schema version
  const metadataPath = path.join(projectRoot, ".nubase", "schema-metadata.json");
  let schemaVersion: string;
  try {
    const metadata = JSON.parse(readFileSync(metadataPath, "utf-8"));
    schemaVersion = metadata.schemaVersion;
  } catch {
    throw new Error(
      "Could not read .nubase/schema-metadata.json. Run `nubase pull` first.",
    );
  }

  // Compute checksum
  const encoder = new TextEncoder();
  const data = encoder.encode(bundle);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const checksum = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Validate bundle size (5MB limit)
  const bundleSizeMB = bundle.length / 1024 / 1024;
  if (bundleSizeMB > 5) {
    throw new Error(
      `Bundle size (${bundleSizeMB.toFixed(2)}MB) exceeds 5MB limit`,
    );
  }

  log.step(`Deploying to ${config.server.url}...`);

  const deployUrl = `${config.server.url}/api/nubase/apps/deploy`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (config.server.token) {
    headers.Authorization = `Bearer ${config.server.token}`;
  }

  const response = await fetch(deployUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      bundle,
      sourceMap,
      manifest,
      checksum,
      schemaVersion,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Deploy failed: ${response.status} ${response.statusText}\n${errorBody}`,
    );
  }

  const result2 = (await response.json()) as {
    version: number;
    id: number;
  };

  log.success(
    `Deployed version ${result2.version} (deployment #${result2.id})`,
  );
}

/**
 * Extract hooks, endpoints, and actions from the bundle by parsing
 * the defineApp() call structure. This is a simple regex-based extraction.
 */
function extractManifest(bundle: string): Manifest {
  const manifest: Manifest = {
    hooks: [],
    endpoints: [],
    actions: [],
  };

  // Extract hook keys — look for patterns like "ticket:before-create"
  const hookPattern =
    /["']([a-z_-]+):(before|after)-(create|update|delete|read)["']/g;
  let match = hookPattern.exec(bundle);
  while (match) {
    const hookKey = match[0].replace(/["']/g, "");
    const entityName = match[1];
    const hookType = `${match[2]}-${match[3]}`;
    manifest.hooks.push({ hookKey, entityName, hookType });
    match = hookPattern.exec(bundle);
  }

  // Extract endpoint definitions — look for method + path patterns
  const endpointPattern =
    /method:\s*["'](GET|POST|PUT|PATCH|DELETE)["'][\s\S]*?path:\s*["']([^"']+)["']/g;
  match = endpointPattern.exec(bundle);
  while (match) {
    manifest.endpoints.push({ method: match[1], path: match[2] });
    match = endpointPattern.exec(bundle);
  }

  // Extract action definitions
  const actionPattern =
    /entity:\s*["']([^"']+)["'][\s\S]*?scope:\s*["'](single|bulk|global)["']/g;
  match = actionPattern.exec(bundle);
  while (match) {
    const entity = match[1];
    const scope = match[2];
    manifest.actions.push({ name: `${entity}-action`, entity, scope });
    match = actionPattern.exec(bundle);
  }

  return manifest;
}
