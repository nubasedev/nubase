import type { Config } from "tailwindcss";

const config: Config = {
	theme: {
		extend: {
			backgroundImage: {
				"glow-conic":
					"conic-gradient(from 180deg at 50% 50%, #2a8af6 0deg, #a853ba 180deg, #e92a67 360deg)",
			},
		},
	},
};
export default config;
