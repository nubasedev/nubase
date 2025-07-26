import type { Action } from "../actions/types";
import type { View } from "./view";

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
> = {
  id: string;
  views: TViews;
  /**
   * Available actions for this resource, defined as an object mapping action IDs to action definitions.
   * This allows views to reference actions by ID in a type-safe manner.
   */
  actions?: TActions;
};

/**
 * Standard view names for resources
 */
export type StandardViews = "create" | "view" | "edit";
