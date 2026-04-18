import type {
  BreadcrumbDefinition,
  BreadcrumbItem,
} from "../config/breadcrumb";
import type { NubaseContextData } from "../context/types";

/**
 * Resolves a BreadcrumbDefinition (static array or callback) into a concrete
 * BreadcrumbItem list. Dynamic callbacks receive the nubase context (with
 * URL params merged in) and the loaded view data, so breadcrumbs can reflect
 * the current record (e.g. "Ticket #42").
 */
export function evaluateBreadcrumbs<TData = unknown>(
  definition: BreadcrumbDefinition | undefined,
  context: NubaseContextData,
  params: Record<string, any> | undefined,
  data: TData | undefined,
): BreadcrumbItem[] | null {
  if (!definition) return null;

  if (Array.isArray(definition)) {
    return definition;
  }

  if (typeof definition === "function") {
    return definition({
      context: { ...context, params: params || {} } as any,
      data,
    });
  }

  return null;
}
