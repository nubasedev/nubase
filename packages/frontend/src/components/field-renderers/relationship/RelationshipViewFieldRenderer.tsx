import { RelationshipSchema } from "@nubase/core";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useWorkspace } from "../../../context/WorkspaceContext";
import { useFieldHandlers } from "../../form/field-handlers-context";
import { useNubaseContext } from "../../nubase-app/NubaseContextProvider";
import { SearchableTable } from "../../searchable-table";
import type { ViewFieldRendererProps } from "../types";

/**
 * View renderer for 1×N relationship fields declared via `nu.relation(...)`.
 * Reads the parent record + the field's `onSearch` handler from the
 * `FieldHandlersProvider` context, fetches rows via the handler, and
 * renders them in a `SearchableTable`. Row clicks navigate to the target
 * resource's view screen.
 */
export const RelationshipViewFieldRenderer = ({
  schema,
  fieldState,
}: ViewFieldRendererProps) => {
  const context = useNubaseContext();
  const navigate = useNavigate();
  const workspace = useWorkspace();
  const { parent, fieldHandlers } = useFieldHandlers();

  const fieldName = fieldState.name;
  const isRelationship = schema instanceof RelationshipSchema;
  const relationship = isRelationship
    ? (schema as RelationshipSchema<any>)
    : null;
  const handler = fieldHandlers?.[fieldName];
  const targetSchema = relationship?._targetSchema;
  const idField = targetSchema
    ? String(targetSchema.getIdField() || "id")
    : "id";

  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!handler || !parent || !relationship) {
      setRows([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const run = async () => {
      try {
        setLoading(true);
        const response = await handler.onSearch({
          parent,
          query,
          context,
        });
        if (!cancelled) {
          setRows(response.data ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(`Failed to load relationship "${fieldName}":`, err);
          setRows([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [handler, parent, query, context, fieldName, relationship]);

  if (!relationship || !targetSchema) {
    // Shouldn't happen — renderer is dispatched by schema.type === "relationship"
    return (
      <div className="text-destructive text-sm">
        Relationship renderer received a non-relationship schema.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {relationship._relationshipLabel && (
        <h2 className="text-lg font-semibold">
          {relationship._relationshipLabel}
        </h2>
      )}
      <div className="h-[400px]">
        <SearchableTable
          schema={targetSchema}
          rows={rows}
          searchValue={query}
          onSearchChange={setQuery}
          loading={loading}
          searchPlaceholder={relationship._searchPlaceholder ?? "Search..."}
          onRowClick={(row) => {
            const rowId = row[idField];
            if (rowId === undefined || rowId === null) return;
            navigate({
              to: "/$workspace/r/$resourceName/$operation",
              params: {
                workspace: workspace.slug,
                resourceName: relationship._targetResourceId,
                operation: "view",
              },
              search: { [idField]: rowId },
            });
          }}
        />
      </div>
    </div>
  );
};
