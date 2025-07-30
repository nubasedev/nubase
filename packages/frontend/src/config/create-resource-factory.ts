import type { ResourceDescriptor, ResourceOperation } from "./resource";

/**
 * Factory function to create a ResourceDescriptor with type inference.
 * Accepts a flexible set of operations while maintaining type safety.
 */
export function createResource<
  TOperations extends Record<string, ResourceOperation>,
>(descriptor: {
  id: string;
  operations: TOperations;
}): ResourceDescriptor<TOperations> {
  return {
    id: descriptor.id,
    operations: descriptor.operations,
  };
}
