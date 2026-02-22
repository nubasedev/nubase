import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["cli/index.ts"],
  outDir: "dist-cli",
  platform: "node",
  format: ["cjs"],
  external: ["fsevents", "uglify-js", "shelljs"],
  sourcemap: true,
  clean: true,
  bundle: true,
  noExternal: ["chalk", "supports-color"],
});
