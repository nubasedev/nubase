import { lazy, Suspense, useMemo, useState } from "react";
import { ActivityIndicator } from "../../../components";
import { cn } from "../../../styling/cn";
import type { HttpResponse } from "../hooks/useHttpToolRequest";

// Lazy load Monaco Editor for better initial bundle size
const MonacoEditor = lazy(
  () => import("../../../components/monaco/MonacoEditor"),
);

interface ResponsePanelProps {
  response: HttpResponse | null;
  error: string | null;
  isLoading: boolean;
}

function getStatusColor(status: number): string {
  if (status === 0) return "text-muted-foreground";
  if (status >= 200 && status < 300)
    return "text-green-600 dark:text-green-400";
  if (status >= 300 && status < 400) return "text-blue-600 dark:text-blue-400";
  if (status >= 400 && status < 500)
    return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}

function StatusBadge({
  status,
  statusText,
}: {
  status: number;
  statusText: string;
}) {
  const colorClass = getStatusColor(status);
  return (
    <span className={cn("font-medium", colorClass)}>
      {status} {statusText}
    </span>
  );
}

export function ResponsePanel({
  response,
  error,
  isLoading,
}: ResponsePanelProps) {
  const [showHeaders, setShowHeaders] = useState(false);

  const formattedBody = useMemo(() => {
    if (!response?.data) return "";
    if (typeof response.data === "string") return response.data;
    try {
      return JSON.stringify(response.data, null, 2);
    } catch {
      return String(response.data);
    }
  }, [response]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
        <ActivityIndicator size="lg" color="primary" />
        <span className="text-sm">Sending request...</span>
      </div>
    );
  }

  if (error && !response) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="text-destructive font-medium mb-2">Request Failed</div>
        <div className="text-sm text-muted-foreground text-center">{error}</div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Response will appear here
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
        <div className="flex items-center gap-4">
          <StatusBadge
            status={response.status}
            statusText={response.statusText}
          />
          <span className="text-sm text-muted-foreground">
            {response.time}ms
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowHeaders(!showHeaders)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {showHeaders ? "Hide Headers" : "Show Headers"}
        </button>
      </div>

      {/* Headers Section */}
      {showHeaders && (
        <div className="p-4 border-b bg-muted/20 max-h-40 overflow-auto">
          <div className="text-sm font-medium mb-2">Response Headers</div>
          <div className="text-xs font-mono space-y-1">
            {Object.entries(response.headers).map(([key, value]) => (
              <div key={key} className="flex">
                <span className="text-muted-foreground mr-2">{key}:</span>
                <span className="text-foreground break-all">{value}</span>
              </div>
            ))}
            {Object.keys(response.headers).length === 0 && (
              <div className="text-muted-foreground">No headers</div>
            )}
          </div>
        </div>
      )}

      {/* Response Body */}
      <div className="flex-1 min-h-0">
        {formattedBody ? (
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full">
                <ActivityIndicator size="md" color="primary" />
              </div>
            }
          >
            <MonacoEditor
              value={formattedBody}
              onChange={() => {}} // Read-only, but Monaco requires onChange
              language="json"
            />
          </Suspense>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No response body
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 border-t bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
