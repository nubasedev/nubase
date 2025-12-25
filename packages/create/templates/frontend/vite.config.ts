import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react(), tailwindcss()],
	build: {
		outDir: "dist",
	},
	server: {
		port: __FRONTEND_PORT__,
		open: "http://localhost:__FRONTEND_PORT__/default",
	},
});
