import loader from "@monaco-editor/loader";
import * as monaco from "monaco-editor";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

// Simple example schema - replace with your actual schema
const exampleSchema = z.object({
  name: z.string(),
  version: z.string(),
  description: z.string().optional(),
});

export async function initializeJsonSchema(): Promise<void> {
  try {
    // Convert the Zod schema to JSON Schema using the library
    const jsonSchema = zodToJsonSchema(exampleSchema, "exampleSchema");

    // Configure JSON language settings
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: true,
      schemas: [
        {
          uri: "project-schema.json", // A unique URI for the schema itself
          schema: jsonSchema,
          fileMatch: ["*"], // Match all JSON files
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

    // JSON schema validation configured successfully
  } catch (error) {
    console.error("Error configuring JSON schema validation:", error);
  }
}

export async function initializeMonaco(): Promise<typeof monaco> {
  loader.config({ monaco });
  await initializeJsonSchema();

  return loader.init();
}
