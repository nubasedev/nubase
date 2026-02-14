import { writeFile } from "node:fs/promises";
import type { PgSchema } from "../types/schema";

export async function saveSchema(
  schema: PgSchema,
  filePath: string,
): Promise<void> {
  const content = JSON.stringify(schema, null, 2);
  await writeFile(filePath, content, "utf-8");
}
