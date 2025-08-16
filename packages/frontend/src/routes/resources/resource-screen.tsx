import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { FullScreenLayout } from "@/components/page-layouts/FullScreenLayout";
import { showToast } from "../../components";
import { useNubaseContext } from "../../components/nubase-app/NubaseContextProvider";
import { ResourceCreateViewRenderer } from "../../components/views/ViewRenderer/screen/ResourceCreateViewRenderer";
import { ResourceSearchViewRenderer } from "../../components/views/ViewRenderer/screen/ResourceSearchViewRenderer";
import { ResourceViewViewRenderer } from "../../components/views/ViewRenderer/screen/ResourceViewViewRenderer";
import type { BreadcrumbItem } from "../../config/breadcrumb";

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
 *
 * **Example:**
 * ```typescript
 * // URL: /r/ticket/view?id=37&active=true
 * // Raw params: { id: "37", active: "true" }
 * // Schema expects: { id: number, active: boolean }
 * // toZodWithCoercion() automatically handles: { id: 37, active: true }
 * ```
 *
 * **How it works:**
 * The ObjectSchema's `toZodWithCoercion()` method returns a Zod schema that uses
 * `z.coerce.number()` and `z.coerce.boolean()` for type conversion during parsing.
 */

export default function ResourceScreen() {
  const { resourceName, operation } = useParams({
    from: "/r/$resourceName/$operation",
  });
  const searchParams = useSearch({ from: "/r/$resourceName/$operation" });
  const context = useNubaseContext();
  const navigate = useNavigate();

  // Check if resources exist in config
  if (!context.config.resources) {
    return <div>Resources not configured</div>;
  }

  // Check if the resource exists
  const resource = context.config.resources[resourceName];
  if (!resource) {
    return <div>Resource "{resourceName}" not found</div>;
  }

  // Check if the operation exists on the resource
  const resourceOperation = resource.operations[operation];
  if (!resourceOperation) {
    return (
      <div>
        Operation "{operation}" not found for resource "{resourceName}"
      </div>
    );
  }

  let element: ReactNode | null = null;
  const loadedData: any = null; // Will be set if data is loaded for dynamic breadcrumbs
  let validatedParams: Record<string, any> | undefined; // Store validated params for breadcrumb evaluation

  // Helper function to evaluate breadcrumbs
  const evaluateBreadcrumbs = (
    breadcrumbDefinition: any,
    params?: Record<string, any>,
    data?: any,
  ): BreadcrumbItem[] | null => {
    if (!breadcrumbDefinition) return null;

    if (Array.isArray(breadcrumbDefinition)) {
      // Static breadcrumbs
      return breadcrumbDefinition;
    }

    if (typeof breadcrumbDefinition === "function") {
      // Dynamic breadcrumbs
      return breadcrumbDefinition({
        context: {
          ...context,
          params: params || {},
        } as any,
        data,
      });
    }

    return null;
  };

  switch (resourceOperation.view.type) {
    case "resource-create":
      element = (
        <ResourceCreateViewRenderer
          view={resourceOperation.view}
          resourceName={resourceName}
          onCreate={(data) => {
            showToast(
              `Resource ${resourceName} created successfully`,
              "default",
            );

            // Check if resource has a "view" operation and redirect to it
            if (resource.operations.view && data) {
              // The data comes from HTTP response, so the actual data is in result.data
              const recordId = data.data?.id || data.id;

              if (recordId) {
                // Add another indicator for successful navigation attempt
                document.title = `NAVIGATING - ${document.title}`;

                navigate({
                  to: "/r/$resourceName/$operation",
                  params: { resourceName, operation: "view" },
                  search: { id: recordId },
                });
              } else {
                document.title = `NO RECORD ID - ${document.title}`;
              }
            } else {
              document.title = `NO VIEW OP - ${document.title}`;
            }
          }}
          onError={(error) => {
            showToast(
              `Error creating resource ${resourceName}: ${error.message}`,
              "error",
            );
          }}
        />
      );
      break;
    case "resource-view": {
      // Parse and validate URL search params using schema's built-in coercion
      // The toZodWithCoercion() method automatically converts strings to expected types
      // Example: ?id=37&active=true becomes { id: 37, active: true }
      if (resourceOperation.view.schemaParams) {
        try {
          validatedParams = resourceOperation.view.schemaParams
            .toZodWithCoercion()
            .parse(searchParams);
        } catch (error) {
          showToast(
            `Invalid URL parameters: ${(error as Error).message}`,
            "error",
          );
          return <div>Invalid URL parameters</div>;
        }
      }

      element = (
        <ResourceViewViewRenderer
          view={resourceOperation.view}
          params={validatedParams}
          onPatch={(_data) => {
            showToast(
              `Resource ${resourceName} updated successfully`,
              "default",
            );
          }}
          onError={(error) => {
            showToast(
              `Error updating resource ${resourceName}: ${error.message}`,
              "error",
            );
          }}
        />
      );
      break;
    }
    case "resource-search": {
      // Parse and validate URL search params using schema's built-in coercion
      if (resourceOperation.view.schemaParams) {
        try {
          validatedParams = resourceOperation.view.schemaParams
            .toZodWithCoercion()
            .parse(searchParams);
        } catch (error) {
          showToast(
            `Invalid URL parameters: ${(error as Error).message}`,
            "error",
          );
          return <div>Invalid URL parameters</div>;
        }
      }

      element = (
        <ResourceSearchViewRenderer
          view={resourceOperation.view}
          params={validatedParams}
          resourceName={resourceName}
          onError={(error) => {
            showToast(
              `Error loading search results for ${resourceName}: ${error.message}`,
              "error",
            );
          }}
        />
      );
      break;
    }
    default:
      return null;
  }

  // Evaluate breadcrumbs based on view definition
  const breadcrumbs = evaluateBreadcrumbs(
    resourceOperation.view.breadcrumbs,
    validatedParams,
    loadedData,
  );

  // Render the view associated with the operation
  return (
    <FullScreenLayout
      title={resourceOperation.view.title}
      breadcrumbs={breadcrumbs || undefined}
    >
      {element}
    </FullScreenLayout>
  );
}
