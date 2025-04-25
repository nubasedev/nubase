import type { Config } from "tailwindcss";
import sharedConfig from "@repo/tailwind-config";

const config: Config = {
  prefix: "ui-",
  presets: [sharedConfig],
};

export default config;
