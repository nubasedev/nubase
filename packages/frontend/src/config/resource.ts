import type { View } from "./view";

/**
 * Represents an operation that can be performed on a resource.
 * For now, each operation references a view, but can be extended with more properties.
 */
export type ResourceOperation<TView extends View<any, any> = View<any, any>> = {
  view: TView;
};

/**
 * A resource descriptor defines the operations available for a resource entity.
 * Can be extended with additional properties as needed.
 */
export type ResourceDescriptor<
  TOperations extends Record<string, ResourceOperation> = Record<
    string,
    ResourceOperation
  >,
> = {
  id: string;
  operations: TOperations;
};

/**
 * Standard operation names for resources
 */
export type StandardOperations = "create" | "view" | "edit";
