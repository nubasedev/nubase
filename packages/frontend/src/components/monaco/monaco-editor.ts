import loader from "@monaco-editor/loader";
import * as monaco from "monaco-editor";
import { z } from "zod";

// Simple example schema - replace with your actual schema
const exampleSchema = z.object({
  name: z.string(),
  version: z.string(),
  description: z.string().optional(),
});

export async function initializeJsonSchema(): Promise<void> {
  try {
    // Convert the Zod schema to JSON Schema using Zod 4's built-in conversion
    const jsonSchema = z.toJSONSchema(exampleSchema, { target: "draft-7" });

    // Configure JSON language settings
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: true,
      schemas: [
        {
          uri: "project-schema.json",
          schema: jsonSchema,
          fileMatch: ["*"],
        },
      ],
      enableSchemaRequest: true,
      schemaValidation: "error",
      schemaRequest: "error",
    });

    // Configure completion and formatting settings
    monaco.languages.json.jsonDefaults.setModeConfiguration({
      documentFormattingEdits: true,
      documentRangeFormattingEdits: true,
      completionItems: true,
      hovers: true,
      documentSymbols: true,
      tokens: true,
      colors: true,
      foldingRanges: true,
      diagnostics: true,
      selectionRanges: true,
    });
  } catch (error) {
    console.error("Error configuring JSON schema validation:", error);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function initializeMonaco(): Promise<typeof monaco> {
  loader.config({ monaco: monaco as any });
  await initializeJsonSchema();

  return loader.init() as unknown as Promise<typeof monaco>;
}
