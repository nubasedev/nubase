import type { ResourceDescriptor } from "./resource";

/**
 * A type-safe link to a resource view.
 *
 * ResourceLink objects are resolved at runtime to include the current workspace.
 * This enables type-safe navigation to resource views without hardcoding paths.
 *
 * @example
 * ```typescript
 * // Create a link to the ticket search view
 * const link = resourceLink(ticketResource, "search");
 *
 * // Use in menu configuration
 * mainMenu: [
 *   { id: "tickets", label: "Tickets", href: resourceLink(ticketResource, "search") }
 * ]
 * ```
 */
export interface ResourceLink<
  TResourceId extends string = string,
  TViewName extends string = string,
> {
  /** Discriminator for identifying ResourceLink objects */
  readonly __type: "resourceLink";
  /** The resource ID (e.g., "ticket") */
  readonly resourceId: TResourceId;
  /** The view name on the resource (e.g., "search", "create", "view") */
  readonly viewName: TViewName;
  /** Optional search params to include in the URL */
  readonly search?: Record<string, unknown>;
}

/**
 * Creates a type-safe link to a resource view.
 *
 * The link is resolved at runtime to include the current workspace prefix.
 * This ensures links work correctly across different workspaces without
 * hardcoding the workspace slug.
 *
 * @param resource - The resource descriptor containing the view
 * @param viewName - The name of the view to link to (type-safe based on resource's views)
 * @param search - Optional search parameters to include in the URL
 * @returns A ResourceLink object that can be used as a MenuItem href
 *
 * @example
 * ```typescript
 * const ticketResource = createResource("ticket")
 *   .withViews({
 *     search: { type: "resource-search", ... },
 *     create: { type: "resource-create", ... },
 *     view: { type: "resource-view", ... }
 *   });
 *
 * // Type-safe: only "search", "create", or "view" are valid
 * resourceLink(ticketResource, "search")
 *
 * // With search params
 * resourceLink(ticketResource, "view", { id: 123 })
 *
 * // TypeScript error: "invalid" is not a valid view name
 * resourceLink(ticketResource, "invalid") // ❌ Type error
 * ```
 */
export function resourceLink<
  TResource extends ResourceDescriptor<any, any>,
  TViewName extends keyof TResource["views"] & string,
>(
  resource: TResource,
  viewName: TViewName,
  search?: Record<string, unknown>,
): ResourceLink<string, TViewName> {
  return {
    __type: "resourceLink",
    resourceId: resource.id,
    viewName,
    search,
  };
}

/**
 * Type guard to check if a value is a ResourceLink.
 */
export function isResourceLink(value: unknown): value is ResourceLink {
  return (
    typeof value === "object" &&
    value !== null &&
    "__type" in value &&
    (value as ResourceLink).__type === "resourceLink"
  );
}

/**
 * Resolves a ResourceLink to a URL path.
 *
 * @param link - The ResourceLink to resolve
 * @param workspaceSlug - The current workspace slug (optional)
 * @returns The resolved URL path
 *
 * @example
 * ```typescript
 * const link = resourceLink(ticketResource, "search");
 * resolveResourceLink(link, "tavern")
 * // Returns: "/tavern/r/ticket/search"
 *
 * resolveResourceLink(link)
 * // Returns: "/r/ticket/search"
 * ```
 */
export function resolveResourceLink(
  link: ResourceLink,
  workspaceSlug?: string,
): string {
  const basePath = `/r/${link.resourceId}/${link.viewName}`;

  if (workspaceSlug) {
    return `/${workspaceSlug}${basePath}`;
  }

  return basePath;
}

/**
 * Resolves a ResourceLink's search params to a query string object.
 */
export function getResourceLinkSearch(
  link: ResourceLink,
): Record<string, unknown> | undefined {
  return link.search;
}
