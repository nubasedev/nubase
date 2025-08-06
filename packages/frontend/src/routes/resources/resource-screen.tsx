import { useParams, useSearch } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { showToast } from "../../components";
import { useNubaseContext } from "../../components/nubase-app/NubaseContextProvider";
import { MaxWidthLayout } from "../../components/page-layouts/MaxWidthLayout/MaxWidthLayout";
import { ResourceCreateViewRenderer } from "../../components/views/ViewRenderer/ResourceCreateViewRenderer";
import { ResourceViewViewRenderer } from "../../components/views/ViewRenderer/ResourceViewViewRenderer";

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

  switch (resourceOperation.view.type) {
    case "resource-create":
      element = (
        <ResourceCreateViewRenderer
          view={resourceOperation.view}
          onCreate={(_data) => {
            // We need to show a toast saying the resource has been created and, if there is a view,
            // we will redirect to that view
            showToast(
              `Resource ${resourceName} created successfully`,
              "success",
            );
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
      let validatedParams: Record<string, any> | undefined;
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
              "success",
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
    default:
      return null;
  }

  // Render the view associated with the operation
  return (
    <MaxWidthLayout title={resourceOperation.view.title}>
      {element}
    </MaxWidthLayout>
  );
}
