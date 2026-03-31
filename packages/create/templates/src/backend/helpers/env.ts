import dotenv from "dotenv";
import path from "node:path";

export function loadEnv(): void {
	const nodeEnv = process.env.NODE_ENV || "development";
	const envFile = `.env.${nodeEnv}`;

	dotenv.config({ path: path.resolve(process.cwd(), envFile) });
	dotenv.config({ path: path.resolve(process.cwd(), ".env") });
}
