import {
  type BaseSchema,
  type ObjectSchema,
  OptionalSchema,
  RelationshipSchema,
  StringSchema,
} from "@nubase/core";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useWorkspace } from "../../../context/WorkspaceContext";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import { useFieldHandlers } from "../../form/field-handlers-context";
import { useNubaseContext } from "../../nubase-app/NubaseContextProvider";
import { SchemaFilterBar } from "../../schema-filter-bar";
import { SearchFilterBar } from "../../search-controls/SearchFilterBar";
import { SchemaTable } from "../../searchable-table";
import type { ViewFieldRendererProps } from "../types";

const SEARCH_DEBOUNCE_MS = 300;
const NQL_DEBOUNCE_MS = 400;

type Row = Record<string, any>;

const isStringField = (fieldSchema: BaseSchema<any> | undefined): boolean => {
  if (!fieldSchema) return false;
  if (fieldSchema instanceof OptionalSchema) {
    return isStringField(fieldSchema.unwrap());
  }
  return fieldSchema instanceof StringSchema;
};

const filterEmbeddedRows = (
  rows: readonly Row[],
  query: string,
  schema: ObjectSchema<any>,
): Row[] => {
  const trimmed = query.trim().toLowerCase();
  if (trimmed === "") return rows.slice();

  const tableLayout = schema.getTableLayout();
  const candidateFieldNames = tableLayout
    ? tableLayout.fields.filter((f) => !f.hidden).map((f) => f.name as string)
    : Object.keys(schema._shape);

  const stringFieldNames = candidateFieldNames.filter((name) =>
    isStringField(schema._shape[name]),
  );

  if (stringFieldNames.length === 0) return rows.slice();

  return rows.filter((row) =>
    stringFieldNames.some((name) => {
      const value = row[name];
      if (value === undefined || value === null) return false;
      return String(value).toLowerCase().includes(trimmed);
    }),
  );
};

/**
 * View renderer for 1×N relationship fields declared via `nu.relation(...)`.
 *
 * Branches on the schema's `source`:
 *
 * - `"remote"` (default): pulls rows via `view.fieldHandlers[fieldName].onSearch`.
 *   Drives a simplified `SchemaFilterBar` (Search / NQL toggle) above a
 *   presentational `SchemaTable`.
 * - `"embedded"`: reads rows from `parent[fieldName]` and filters them
 *   client-side using a plain search input. No fetch, no NQL.
 *
 * Row clicks navigate to the target resource's view screen in both cases.
 */
export const RelationshipViewFieldRenderer = ({
  schema,
  fieldState,
}: ViewFieldRendererProps) => {
  const fieldName = fieldState.name;
  const isRelationship = schema instanceof RelationshipSchema;
  const relationship = isRelationship
    ? (schema as RelationshipSchema<any>)
    : null;

  if (!relationship) {
    return (
      <div className="text-destructive text-sm">
        Relationship renderer received a non-relationship schema.
      </div>
    );
  }

  if (relationship._source === "embedded") {
    return (
      <EmbeddedRelationshipView
        relationship={relationship}
        fieldName={fieldName}
      />
    );
  }

  return (
    <RemoteRelationshipView relationship={relationship} fieldName={fieldName} />
  );
};

type BranchProps = {
  relationship: RelationshipSchema<any>;
  fieldName: string;
};

const RemoteRelationshipView = ({ relationship, fieldName }: BranchProps) => {
  const context = useNubaseContext();
  const navigate = useNavigate();
  const workspace = useWorkspace();
  const { parent, fieldHandlers } = useFieldHandlers();

  const handler = fieldHandlers?.[fieldName];
  const targetSchema = relationship._targetSchema;
  const idField = String(targetSchema.getIdField() || "id");

  const [searchValue, setSearchValue] = useState("");
  const [nqlMode, setNqlMode] = useState(false);
  const [nqlValue, setNqlValue] = useState("");

  const debouncedSearch = useDebouncedValue(searchValue, SEARCH_DEBOUNCE_MS);
  const debouncedNql = useDebouncedValue(nqlValue, NQL_DEBOUNCE_MS);

  const queryParam = nqlMode ? "" : debouncedSearch;
  const nqlParam = nqlMode ? debouncedNql : "";

  const enabled = !!handler && !!parent;

  const {
    data: rows = [],
    isFetching,
    error,
  } = useQuery({
    queryKey: [
      "relationship-search",
      relationship._targetResourceId,
      fieldName,
      parent,
      queryParam,
      nqlParam,
    ],
    queryFn: async () => {
      const response = await handler?.onSearch({
        parent,
        query: queryParam,
        nql: nqlParam,
        context,
      });
      return response?.data ?? [];
    },
    enabled,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (error) {
      console.error(`Failed to load relationship "${fieldName}":`, error);
    }
  }, [error, fieldName]);

  const handleNqlModeChange = (enabledNql: boolean) => {
    setNqlMode(enabledNql);
    if (!enabledNql) setNqlValue("");
  };

  return (
    <div className="flex flex-col h-[400px] w-full space-y-2">
      <SchemaFilterBar
        mode="simplified"
        schema={targetSchema}
        filterDescriptors={[]}
        filterState={{}}
        onFilterChange={() => {}}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder={relationship._searchPlaceholder ?? "Search..."}
        nqlMode={nqlMode}
        onNqlModeChange={handleNqlModeChange}
        nqlValue={nqlValue}
        onNqlValueChange={setNqlValue}
      />
      <SchemaTable
        schema={targetSchema}
        rows={rows}
        loading={isFetching}
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

const EmbeddedRelationshipView = ({ relationship, fieldName }: BranchProps) => {
  const navigate = useNavigate();
  const workspace = useWorkspace();
  const { parent } = useFieldHandlers();

  const targetSchema = relationship._targetSchema;
  const idField = String(targetSchema.getIdField() || "id");

  const allRows = useMemo<Row[]>(() => {
    const value = parent?.[fieldName];
    return Array.isArray(value) ? value : [];
  }, [parent, fieldName]);

  const [searchValue, setSearchValue] = useState("");

  const filteredRows = useMemo(
    () => filterEmbeddedRows(allRows, searchValue, targetSchema),
    [allRows, searchValue, targetSchema],
  );

  return (
    <div className="flex flex-col h-[400px] w-full space-y-2">
      <SearchFilterBar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder={relationship._searchPlaceholder ?? "Search..."}
        searchExpand
        showClearFilters={false}
      />
      <SchemaTable
        schema={targetSchema}
        rows={filteredRows}
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
