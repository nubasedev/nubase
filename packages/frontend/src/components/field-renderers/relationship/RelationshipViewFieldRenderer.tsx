import { RelationshipSchema } from "@nubase/core";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useWorkspace } from "../../../context/WorkspaceContext";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import { useFieldHandlers } from "../../form/field-handlers-context";
import { useNubaseContext } from "../../nubase-app/NubaseContextProvider";
import { SearchableTable } from "../../searchable-table";
import type { ViewFieldRendererProps } from "../types";

const SEARCH_DEBOUNCE_MS = 300;

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
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);

  const enabled = !!handler && !!parent && !!relationship;

  const {
    data: rows = [],
    isFetching,
    error,
  } = useQuery({
    queryKey: [
      "relationship-search",
      relationship?._targetResourceId,
      fieldName,
      parent,
      debouncedQuery,
    ],
    queryFn: async () => {
      const response = await handler?.onSearch({
        parent,
        query: debouncedQuery,
        context,
      });
      return response.data ?? [];
    },
    enabled,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (error) {
      console.error(`Failed to load relationship "${fieldName}":`, error);
    }
  }, [error, fieldName]);

  if (!relationship || !targetSchema) {
    return (
      <div className="text-destructive text-sm">
        Relationship renderer received a non-relationship schema.
      </div>
    );
  }

  return (
    <div className="h-[400px]">
      <SearchableTable
        schema={targetSchema}
        rows={rows}
        searchValue={query}
        onSearchChange={setQuery}
        searchDebounceMs={0}
        loading={isFetching}
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
  );
};
