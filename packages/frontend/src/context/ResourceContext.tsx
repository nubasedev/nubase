import type React from "react";
import { createContext, useContext } from "react";

/**
 * Data structure for resource context that tracks the current resource and selected IDs
 */
export interface ResourceContextData {
  /**
   * The type/name of the current resource (e.g., "ticket", "user")
   */
  resourceType: string;
  /**
   * Set of selected resource IDs from the DataGrid
   */
  selectedIds: ReadonlySet<string | number>;
}

/**
 * React context for resource selection state
 */
export const ResourceContext = createContext<ResourceContextData | null>(null);

/**
 * Provider component for resource context
 */
export interface ResourceContextProviderProps {
  children: React.ReactNode;
  resourceType: string;
  selectedIds: ReadonlySet<string | number>;
}

export function ResourceContextProvider({
  children,
  resourceType,
  selectedIds,
}: ResourceContextProviderProps) {
  const value: ResourceContextData = {
    resourceType,
    selectedIds,
  };

  return (
    <ResourceContext.Provider value={value}>
      {children}
    </ResourceContext.Provider>
  );
}

/**
 * Hook to access the resource context
 * @returns ResourceContextData or null if not within a ResourceContextProvider
 */
export function useResourceContext(): ResourceContextData | null {
  return useContext(ResourceContext);
}

/**
 * Hook to access the resource context with error throwing if not available
 * @returns ResourceContextData
 * @throws Error if not within a ResourceContextProvider
 */
export function useRequiredResourceContext(): ResourceContextData {
  const context = useContext(ResourceContext);
  if (!context) {
    throw new Error(
      "useRequiredResourceContext must be used within a ResourceContextProvider",
    );
  }
  return context;
}
