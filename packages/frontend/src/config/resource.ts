import type { Lookup } from "@nubase/core";
import type { Action } from "../actions/types";
import type { HttpResponse } from "../http/http-client";
import type { View } from "./view";

/**
 * Configuration for lookup/search behavior of a resource.
 * Defines how to search for entities when this resource is used as a lookup target.
 */
export type ResourceLookupConfig = {
  /**
   * Callback to search for lookup items.
   * Called by the renderer with the query and context.
   * @param args - Contains the query string and context
   * @returns Promise resolving to an HttpResponse with Lookup[] data
   */
  onSearch: (args: {
    query: string;
    context: unknown;
  }) => Promise<HttpResponse<Lookup[]>>;

  /**
   * Minimum number of characters before triggering search.
   * @default 1
   */
  minQueryLength?: number;

  /**
   * Debounce delay in milliseconds before triggering search.
   * @default 300
   */
  debounceMs?: number;
};

/**
 * A resource descriptor defines the views available for a resource entity.
 * Views are directly accessible without an intermediate operation wrapper.
 * Can be extended with additional properties as needed.
 */
export type ResourceDescriptor<
  TViews extends Record<string, View<any, any, any, any>> = Record<
    string,
    View<any, any, any, any>
  >,
  TActions extends Record<string, Action> = Record<string, Action>,
  TLookup extends ResourceLookupConfig | undefined = undefined,
> = {
  id: string;
  views: TViews;
  /**
   * Available actions for this resource, defined as an object mapping action IDs to action definitions.
   * This allows views to reference actions by ID in a type-safe manner.
   */
  actions?: TActions;
  /**
   * Lookup configuration for when this resource is used as a search/reference target.
   * Enables other resources to reference this one via lookup fields.
   */
  lookup?: TLookup;
};

/**
 * Standard view names for resources
 */
export type StandardViews = "create" | "view" | "edit";
