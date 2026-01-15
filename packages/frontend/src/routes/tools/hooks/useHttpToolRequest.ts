import type { RequestSchema } from "@nubase/core";
import { useCallback, useMemo, useState } from "react";
import {
  buildUrlWithPathParams,
  extractPathParamKeys,
} from "../../../utils/url-params";

export interface HttpResponse {
  status: number;
  statusText: string;
  data: any;
  time: number;
  headers: Record<string, string>;
}

export interface EndpointOption {
  key: string;
  endpoint: RequestSchema;
  label: string;
}

export interface UseHttpToolRequestOptions {
  apiEndpoints: Record<string, RequestSchema>;
  apiBaseUrl: string;
}

export interface UseHttpToolRequestResult {
  // Endpoint selection
  selectedEndpointKey: string | null;
  selectedEndpoint: RequestSchema | null;
  endpointOptions: EndpointOption[];
  selectEndpoint: (key: string | null) => void;

  // Path parameters
  pathParams: Record<string, string>;
  setPathParam: (key: string, value: string) => void;
  pathParamKeys: string[];

  // Query parameters
  hasQueryParams: boolean;

  // Request body
  requestBody: string;
  setRequestBody: (body: string) => void;
  hasRequestBody: boolean;

  // Whether the endpoint has any configurable params (path, query, or body)
  hasAnyParams: boolean;

  // Response
  response: HttpResponse | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  executeRequest: () => Promise<void>;
  clearResponse: () => void;
}

/**
 * Creates a label from an endpoint key and schema.
 * Example: "getTicket" with path "/tickets/:id" => "GET /tickets/:id (getTicket)"
 */
function createEndpointLabel(_key: string, endpoint: RequestSchema): string {
  return `${endpoint.method} ${endpoint.path}`;
}

export function useHttpToolRequest(
  options: UseHttpToolRequestOptions,
): UseHttpToolRequestResult {
  const { apiEndpoints, apiBaseUrl } = options;

  // State
  const [selectedEndpointKey, setSelectedEndpointKey] = useState<string | null>(
    null,
  );
  const [pathParams, setPathParams] = useState<Record<string, string>>({});
  const [requestBody, setRequestBody] = useState<string>("{}");
  const [response, setResponse] = useState<HttpResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derived values
  const endpointOptions = useMemo<EndpointOption[]>(() => {
    return Object.entries(apiEndpoints).map(([key, endpoint]) => ({
      key,
      endpoint,
      label: createEndpointLabel(key, endpoint),
    }));
  }, [apiEndpoints]);

  const selectedEndpoint = useMemo(() => {
    if (!selectedEndpointKey) return null;
    return apiEndpoints[selectedEndpointKey] ?? null;
  }, [apiEndpoints, selectedEndpointKey]);

  const pathParamKeys = useMemo(() => {
    if (!selectedEndpoint) return [];
    return extractPathParamKeys(selectedEndpoint.path);
  }, [selectedEndpoint]);

  const hasRequestBody = useMemo(() => {
    if (!selectedEndpoint) return false;
    return (
      selectedEndpoint.requestBody !== undefined &&
      ["POST", "PUT", "PATCH"].includes(selectedEndpoint.method)
    );
  }, [selectedEndpoint]);

  // Check if there are query params (requestParams minus path params)
  const hasQueryParams = useMemo(() => {
    if (!selectedEndpoint?.requestParams) return false;
    const requestParamKeys = Object.keys(
      selectedEndpoint.requestParams._shape ?? {},
    );
    // Query params are requestParams that are not path params
    const queryParamKeys = requestParamKeys.filter(
      (key) => !pathParamKeys.includes(key),
    );
    return queryParamKeys.length > 0;
  }, [selectedEndpoint, pathParamKeys]);

  // Check if endpoint has any configurable params at all
  const hasAnyParams = useMemo(() => {
    return pathParamKeys.length > 0 || hasQueryParams || hasRequestBody;
  }, [pathParamKeys, hasQueryParams, hasRequestBody]);

  // Actions
  const selectEndpoint = useCallback((key: string | null) => {
    setSelectedEndpointKey(key);
    setPathParams({});
    setRequestBody("{}");
    setResponse(null);
    setError(null);
  }, []);

  const setPathParam = useCallback((key: string, value: string) => {
    setPathParams((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const clearResponse = useCallback(() => {
    setResponse(null);
    setError(null);
  }, []);

  const executeRequest = useCallback(async () => {
    if (!selectedEndpoint) {
      setError("No endpoint selected");
      return;
    }

    setIsLoading(true);
    setError(null);

    const startTime = performance.now();

    try {
      // Build the URL with path params
      const builtPath = buildUrlWithPathParams(
        selectedEndpoint.path,
        pathParams,
      );
      const fullUrl = `${apiBaseUrl}${builtPath}`;

      // Prepare request options
      const fetchOptions: RequestInit = {
        method: selectedEndpoint.method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      };

      // Add body for POST/PUT/PATCH requests
      if (hasRequestBody && requestBody.trim()) {
        try {
          // Validate JSON before sending
          JSON.parse(requestBody);
          fetchOptions.body = requestBody;
        } catch (_parseError) {
          setError("Invalid JSON in request body");
          setIsLoading(false);
          return;
        }
      }

      // Execute the request
      const fetchResponse = await fetch(fullUrl, fetchOptions);
      const endTime = performance.now();

      // Parse response headers
      const responseHeaders: Record<string, string> = {};
      fetchResponse.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      // Parse response body
      let responseData: any;
      const contentType = fetchResponse.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        responseData = await fetchResponse.json();
      } else {
        responseData = await fetchResponse.text();
      }

      setResponse({
        status: fetchResponse.status,
        statusText: fetchResponse.statusText,
        data: responseData,
        time: Math.round(endTime - startTime),
        headers: responseHeaders,
      });
    } catch (fetchError) {
      const endTime = performance.now();
      setError(
        fetchError instanceof Error ? fetchError.message : "Request failed",
      );
      setResponse({
        status: 0,
        statusText: "Network Error",
        data: null,
        time: Math.round(endTime - startTime),
        headers: {},
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedEndpoint, pathParams, requestBody, apiBaseUrl, hasRequestBody]);

  return {
    selectedEndpointKey,
    selectedEndpoint,
    endpointOptions,
    selectEndpoint,
    pathParams,
    setPathParam,
    pathParamKeys,
    hasQueryParams,
    requestBody,
    setRequestBody,
    hasRequestBody,
    hasAnyParams,
    response,
    isLoading,
    error,
    executeRequest,
    clearResponse,
  };
}
