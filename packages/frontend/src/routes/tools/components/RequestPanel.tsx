import type { ObjectSchema, RequestSchema } from "@nubase/core";
import { lazy, Suspense, useMemo } from "react";
import { ActivityIndicator, Label } from "../../../components";
import { SchemaFormBody } from "../../../components/form/SchemaForm/SchemaFormBody";
import { useSchemaForm } from "../../../hooks";
import { PathParamEditor } from "./PathParamEditor";

// Lazy load Monaco Editor for better initial bundle size
const MonacoEditor = lazy(
  () => import("../../../components/monaco/MonacoEditor"),
);

// Empty schema fallback
const emptySchema = {
  _shape: {},
  toZod: () => ({}) as any,
  omit: () => emptySchema,
} as unknown as ObjectSchema<any>;

interface RequestPanelProps {
  endpoint: RequestSchema | null;
  pathParamKeys: string[];
  pathParams: Record<string, string>;
  onPathParamChange: (key: string, value: string) => void;
  requestBody: string;
  onRequestBodyChange: (body: string) => void;
  hasRequestBody: boolean;
}

export function RequestPanel({
  endpoint,
  pathParamKeys,
  pathParams,
  onPathParamChange,
  requestBody,
  onRequestBodyChange,
  hasRequestBody,
}: RequestPanelProps) {
  // Filter out path params from requestParams to get only query params
  // requestParams contains BOTH path params and query params, but path params
  // are already handled by PathParamEditor
  const queryParamsSchema = useMemo(() => {
    if (!endpoint?.requestParams) return emptySchema;
    if (pathParamKeys.length === 0) return endpoint.requestParams;

    // Omit path param keys from the schema to get only query params
    try {
      return endpoint.requestParams.omit(
        ...(pathParamKeys as [string, ...string[]]),
      );
    } catch {
      // If omit fails (e.g., keys don't exist), return the original
      return endpoint.requestParams;
    }
  }, [endpoint, pathParamKeys]);

  // Create a schema form for the query params
  const paramsForm = useSchemaForm({
    schema: queryParamsSchema,
    onSubmit: () => {},
    mode: "edit",
  });

  // Check if there are any query params (after filtering out path params)
  const hasQueryParams = useMemo(() => {
    return Object.keys(queryParamsSchema._shape ?? {}).length > 0;
  }, [queryParamsSchema]);

  if (!endpoint) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Select an endpoint to configure the request
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-auto p-4">
      <div className="space-y-6">
        {/* Path Parameters */}
        <PathParamEditor
          paramKeys={pathParamKeys}
          values={pathParams}
          onChange={onPathParamChange}
        />

        {/* Query Parameters from Schema */}
        {hasQueryParams && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Query Parameters</Label>
            <SchemaFormBody form={paramsForm} />
          </div>
        )}

        {/* Request Body */}
        {hasRequestBody && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Request Body</Label>
            <div className="h-64 rounded-md border overflow-hidden">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-full">
                    <ActivityIndicator size="md" color="primary" />
                  </div>
                }
              >
                <MonacoEditor
                  value={requestBody}
                  onChange={onRequestBodyChange}
                  language="json"
                />
              </Suspense>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
