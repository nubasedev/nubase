import sharedConfig from "@repo/tailwind-config";
import type { Config } from "tailwindcss";

const config: Config = {
	prefix: "ui-",
	presets: [sharedConfig],
};

export default config;
