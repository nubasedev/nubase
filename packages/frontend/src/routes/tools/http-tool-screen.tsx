import type { RequestSchema } from "@nubase/core";
import { useCallback, useMemo, useRef, useState } from "react";
import { Button } from "../../components";
import {
  Select,
  type SelectOption,
} from "../../components/form-controls/controls/Select/Select";
import { useNubaseContext } from "../../components/nubase-app/NubaseContextProvider";
import { HorizontalResizeHandle } from "../../components/resize-handle/HorizontalResizeHandle";
import { RequestPanel } from "./components/RequestPanel";
import { ResponsePanel } from "./components/ResponsePanel";
import { useHttpToolRequest } from "./hooks/useHttpToolRequest";

const MIN_PANEL_WIDTH = 300;

export default function HttpToolScreen() {
  const { config } = useNubaseContext();

  // Get API endpoints from config
  const apiEndpoints = (config.apiEndpoints ?? {}) as Record<
    string,
    RequestSchema
  >;
  const apiBaseUrl = config.apiBaseUrl ?? "";

  // HTTP request hook
  const {
    selectedEndpointKey,
    selectedEndpoint,
    endpointOptions,
    selectEndpoint,
    pathParams,
    setPathParam,
    pathParamKeys,
    requestBody,
    setRequestBody,
    hasRequestBody,
    hasAnyParams,
    response,
    isLoading,
    error,
    executeRequest,
  } = useHttpToolRequest({
    apiEndpoints,
    apiBaseUrl,
  });

  // Convert endpoint options to Select options
  const selectOptions = useMemo<SelectOption<string>[]>(
    () =>
      endpointOptions.map((opt) => ({
        value: opt.key,
        label: opt.label,
      })),
    [endpointOptions],
  );

  // Resize handling
  const containerRef = useRef<HTMLDivElement>(null);
  const [leftPanelWidth, setLeftPanelWidth] = useState<number>(400);
  const isDraggingRef = useRef(false);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDraggingRef.current = true;

      const startX = e.clientX;
      const startWidth = leftPanelWidth;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!isDraggingRef.current || !containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const deltaX = moveEvent.clientX - startX;
        const newWidth = Math.max(
          MIN_PANEL_WIDTH,
          Math.min(startWidth + deltaX, containerRect.width - MIN_PANEL_WIDTH),
        );

        setLeftPanelWidth(newWidth);
      };

      const handleMouseUp = () => {
        isDraggingRef.current = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [leftPanelWidth],
  );

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header with Endpoint Selector and Send Button */}
      <div className="flex items-center gap-3 border-b p-4">
        <div className="flex-1">
          <Select
            options={selectOptions}
            value={selectedEndpointKey}
            onChange={(value) => selectEndpoint(value)}
            placeholder="Select an endpoint..."
            searchable
            emptyMessage="No endpoints found"
          />
        </div>
        <Button
          onClick={executeRequest}
          isLoading={isLoading}
          disabled={!selectedEndpoint}
        >
          Send
        </Button>
      </div>

      {/* Main Content - Split Panels (or just response if no params) */}
      <div ref={containerRef} className="flex flex-1 min-h-0 relative">
        {/* Request Panel - only shown if endpoint has params */}
        {hasAnyParams && (
          <div
            className="h-full border-r relative"
            style={{ width: leftPanelWidth, flexShrink: 0 }}
          >
            <RequestPanel
              endpoint={selectedEndpoint}
              pathParamKeys={pathParamKeys}
              pathParams={pathParams}
              onPathParamChange={setPathParam}
              requestBody={requestBody}
              onRequestBodyChange={setRequestBody}
              hasRequestBody={hasRequestBody}
            />
            <HorizontalResizeHandle
              onMouseDown={handleMouseDown}
              align="right"
            />
          </div>
        )}

        {/* Response Panel */}
        <div className="flex-1 min-w-0 h-full">
          <ResponsePanel
            response={response}
            error={error}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
