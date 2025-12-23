import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { FullScreenFixedHeaderLayout } from "@/components/page-layouts/FullScreenFixedHeaderLayout";
import { showToast } from "../../components";
import { useNubaseContext } from "../../components/nubase-app/NubaseContextProvider";
import { ResourceCreateViewRenderer } from "../../components/views/ViewRenderer/screen/ResourceCreateViewRenderer";
import { ResourceSearchViewRenderer } from "../../components/views/ViewRenderer/screen/ResourceSearchViewRenderer";
import { ResourceViewViewRenderer } from "../../components/views/ViewRenderer/screen/ResourceViewViewRenderer";
import type { BreadcrumbItem } from "../../config/breadcrumb";
import { useTenant } from "../../context/TenantContext";

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
  const params = useParams({ strict: false });
  const resourceName = params.resourceName as string;
  const operation = params.operation as string;
  const searchParams = useSearch({ strict: false });
  const context = useNubaseContext();
  const navigate = useNavigate();
  const tenant = useTenant();

  // Check if resources exist in config
  if (!context.config.resources) {
    return <div>Resources not configured</div>;
  }

  // Check if the resource exists
  const resource = context.config.resources[resourceName];
  if (!resource) {
    return <div>Resource "{resourceName}" not found</div>;
  }

  // Check if the view exists on the resource
  const resourceView = resource.views[operation];
  if (!resourceView) {
    return (
      <div>
        View "{operation}" not found for resource "{resourceName}"
      </div>
    );
  }

  let body: ReactNode | null = null;
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

  switch (resourceView.type) {
    case "resource-create":
      body = (
        <ResourceCreateViewRenderer
          view={resourceView}
          resourceName={resourceName}
          onCreate={(data) => {
            showToast(
              `Resource ${resourceName} created successfully`,
              "default",
            );

            // Check if resource has a "view" view and redirect to it
            if (resource.views.view && data) {
              // The data comes from HTTP response, so the actual data is in result.data
              const recordId = data.data?.id || data.id;

              if (recordId) {
                // Add another indicator for successful navigation attempt
                document.title = `NAVIGATING - ${document.title}`;

                navigate({
                  to: "/$tenant/r/$resourceName/$operation",
                  params: {
                    tenant: tenant.slug,
                    resourceName,
                    operation: "view",
                  },
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
      if (resourceView.schemaParams) {
        try {
          validatedParams = resourceView.schemaParams
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

      body = (
        <ResourceViewViewRenderer
          view={resourceView}
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
      if (resourceView.schemaParams) {
        try {
          validatedParams = resourceView.schemaParams
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

      body = (
        <ResourceSearchViewRenderer
          view={resourceView}
          params={validatedParams}
          resourceName={resourceName}
          resource={resource}
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
    resourceView.breadcrumbs,
    validatedParams,
    loadedData,
  );

  // Render the view
  return (
    <FullScreenFixedHeaderLayout
      title={resourceView.title}
      breadcrumbs={breadcrumbs || undefined}
    >
      {body}
    </FullScreenFixedHeaderLayout>
  );
}
