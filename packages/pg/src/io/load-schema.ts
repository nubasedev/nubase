import { readFile } from "node:fs/promises";
import type { PgSchema } from "../types/schema";

export async function loadSchema(filePath: string): Promise<PgSchema> {
  const content = await readFile(filePath, "utf-8");
  return JSON.parse(content) as PgSchema;
}
