import type {
  BaseSchema,
  ObjectSchema,
  SchemaMetadata,
  TableLayoutField,
} from "@nubase/core";
import { OptionalSchema } from "@nubase/core";
import type { Column, RenderEditCellProps } from "../types";
import { resolveEditRenderer, resolveViewRenderer } from "./cell-renderers";
import {
  DataGridCellPatchWrapper,
  type PatchResult,
} from "./DataGridCellPatchWrapper";

export interface CreatePatchableColumnOptions<
  TRow,
  TShape extends Record<string, BaseSchema<any>>,
> {
  /** The field configuration from the table layout */
  field: TableLayoutField<TShape>;
  /** The schema containing the field definitions */
  schema: ObjectSchema<TShape>;
  /** Function to get the row ID */
  getRowId: (row: TRow) => string | number;
  /** Function to perform the patch operation */
  onPatch: (params: {
    rowId: string | number;
    fieldName: string;
    value: any;
  }) => Promise<PatchResult>;
}

/**
 * Creates a DataGrid column with patching capability.
 * When the column is editable, clicking a cell will open an inline editor
 * that validates and patches the value to the backend.
 */
export function createPatchableColumn<
  TRow,
  TShape extends Record<string, BaseSchema<any>>,
>(options: CreatePatchableColumnOptions<TRow, TShape>): Column<TRow> {
  const { field, schema, getRowId, onPatch } = options;
  const fieldName = field.name as string;
  const fieldSchema = schema._shape[fieldName];

  if (!fieldSchema) {
    throw new Error(`Field "${fieldName}" not found in schema`);
  }

  // Unwrap optional schemas to get the actual type
  const actualSchema =
    fieldSchema instanceof OptionalSchema ? fieldSchema.unwrap() : fieldSchema;

  // Get metadata from the schema
  const metadata: SchemaMetadata = actualSchema._meta || {};

  // Determine if the column is editable and what type
  const isEditable =
    field.editable === true || field.editable === "auto-commit";
  const isAutoCommit = field.editable === "auto-commit";

  // Get the schema type for rendering
  const schemaType = actualSchema.type;

  // Build the column object with all properties at once (Column has readonly properties)
  if (isEditable) {
    // Create column with edit capabilities
    return {
      key: fieldName,
      name: field.label || metadata.label || fieldName,
      width: field.columnWidthPx || 150,
      minWidth: 50,
      resizable: true,
      frozen: field.pinned === true,
      editable: true,
      renderCell: ({ row }: { row: TRow }) => {
        const value = (row as Record<string, unknown>)[fieldName];
        return resolveViewRenderer(schemaType, value, metadata);
      },
      renderEditCell: ({ row, onClose }: RenderEditCellProps<TRow>) => {
        const value = (row as Record<string, unknown>)[fieldName];
        const rowId = getRowId(row);

        return (
          <DataGridCellPatchWrapper
            value={value}
            schema={actualSchema}
            metadata={metadata}
            renderEditCell={(props) => {
              const result = resolveEditRenderer(schemaType, props);
              // If the field is configured as auto-commit, honor that
              // But also respect the renderer's natural auto-commit behavior (e.g., boolean)
              if (isAutoCommit || result.autoCommit) {
                return { ...result, autoCommit: true };
              }
              return result;
            }}
            onPatch={async (patchValue) => {
              return onPatch({
                rowId,
                fieldName,
                value: patchValue,
              });
            }}
            onClose={(commit) => {
              onClose(commit);
            }}
          />
        );
      },
      editorOptions: {
        // Don't auto-commit on outside click for non-auto-commit fields
        // as we have our own action bar
        commitOnOutsideClick: isAutoCommit,
      },
    };
  }

  // Create read-only column (no edit capabilities)
  return {
    key: fieldName,
    name: field.label || metadata.label || fieldName,
    width: field.columnWidthPx || 150,
    minWidth: 50,
    resizable: true,
    frozen: field.pinned === true,
    editable: false,
    renderCell: ({ row }: { row: TRow }) => {
      const value = (row as Record<string, unknown>)[fieldName];
      return resolveViewRenderer(schemaType, value, metadata);
    },
  };
}

/**
 * Creates multiple patchable columns from a table layout.
 */
export function createPatchableColumns<
  TRow,
  TShape extends Record<string, BaseSchema<any>>,
>(options: {
  fields: TableLayoutField<TShape>[];
  schema: ObjectSchema<TShape>;
  getRowId: (row: TRow) => string | number;
  onPatch: (params: {
    rowId: string | number;
    fieldName: string;
    value: any;
  }) => Promise<PatchResult>;
}): Column<TRow>[] {
  const { fields, schema, getRowId, onPatch } = options;

  return fields
    .filter((field) => !field.hidden)
    .map((field) =>
      createPatchableColumn({
        field,
        schema,
        getRowId,
        onPatch,
      }),
    );
}
