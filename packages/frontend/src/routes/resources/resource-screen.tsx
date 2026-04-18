import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useNubaseContext } from "../../components/nubase-app/NubaseContextProvider";
import { ResourceCreateViewRenderer } from "../../components/views/ViewRenderer/screen/ResourceCreateViewRenderer";
import { ResourceSearchViewRenderer } from "../../components/views/ViewRenderer/screen/ResourceSearchViewRenderer";
import { ResourceViewViewRenderer } from "../../components/views/ViewRenderer/screen/ResourceViewViewRenderer";
import { useWorkspace } from "../../context/WorkspaceContext";
import { emitEvent } from "../../events";

/**
 * URL Parameter Coercion System
 *
 * **The Problem:**
 * URL search params always arrive as strings (e.g., `?id=37` gives `id: "37"`),
 * but Nubase schemas often expect typed values (numbers, booleans).
 *
 * **The Solution:**
 * We use Zod's built-in coercion via the schema's `toZodWithCoercion()` method:
 * - `"37"` → `37` (number)
 * - `"true"` → `true` (boolean)
 * - `"hello"` → `"hello"` (string, unchanged)
 */

export default function ResourceScreen() {
  const params = useParams({ strict: false });
  const resourceName = params.resourceName as string;
  const operation = params.operation as string;
  const searchParams = useSearch({ strict: false });
  const context = useNubaseContext();
  const navigate = useNavigate();
  const workspace = useWorkspace();

  if (!context.config.resources) {
    return <div>Resources not configured</div>;
  }

  const resource = context.config.resources[resourceName];
  if (!resource) {
    return <div>Resource "{resourceName}" not found</div>;
  }

  const resourceView = resource.views[operation];
  if (!resourceView) {
    return (
      <div>
        View "{operation}" not found for resource "{resourceName}"
      </div>
    );
  }

  let body: ReactNode | null = null;
  let validatedParams: Record<string, any> | undefined;

  switch (resourceView.type) {
    case "resource-create":
      body = (
        <ResourceCreateViewRenderer
          view={resourceView}
          resourceName={resourceName}
          onCreate={(data) => {
            emitEvent("resource.created", { resourceName, source: "form" });

            if (resource.views.view && data) {
              const recordId = data.data?.id || data.id;
              if (recordId) {
                navigate({
                  to: "/$workspace/r/$resourceName/$operation",
                  params: {
                    workspace: workspace.slug,
                    resourceName,
                    operation: "view",
                  },
                  search: { id: recordId },
                });
              }
            }
          }}
          onError={(error) => {
            emitEvent("resource.saveFailed", {
              resourceName,
              error,
              source: "form",
            });
          }}
        />
      );
      break;
    case "resource-view": {
      if (resourceView.schemaParams) {
        try {
          validatedParams = resourceView.schemaParams
            .toZodWithCoercion()
            .parse(searchParams);
        } catch (error) {
          emitEvent("navigation.invalidParams", {
            error: (error as Error).message,
            path: `${resourceName}/${operation}`,
          });
          return <div>Invalid URL parameters</div>;
        }
      }

      body = (
        <ResourceViewViewRenderer
          view={resourceView}
          params={validatedParams}
          resourceName={resourceName}
          onPatch={(_data) => {
            emitEvent("resource.patched", { resourceName, source: "form" });
          }}
          onError={(error) => {
            emitEvent("resource.saveFailed", {
              resourceName,
              error,
              source: "form",
            });
          }}
        />
      );
      break;
    }
    case "resource-search": {
      if (resourceView.schemaParams) {
        try {
          validatedParams = resourceView.schemaParams
            .toZodWithCoercion()
            .parse(searchParams);
        } catch (error) {
          emitEvent("navigation.invalidParams", {
            error: (error as Error).message,
            path: `${resourceName}/${operation}`,
          });
          return <div>Invalid URL parameters</div>;
        }
      }

      body = (
        <ResourceSearchViewRenderer
          view={resourceView}
          params={validatedParams}
          resourceName={resourceName}
          resource={resource}
          onError={(error) => {
            emitEvent("resource.loadFailed", { resourceName, error });
          }}
        />
      );
      break;
    }
    default:
      return null;
  }

  // The individual renderers provide their own header (breadcrumbs + title).
  // We just wrap with full-screen padding so they align with the rest of the shell.
  return (
    <div data-component="ResourceScreen" className="flex flex-col h-full p-4">
      {body}
    </div>
  );
}
