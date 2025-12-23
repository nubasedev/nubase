import { createContext, useContext } from "react";

/**
 * Workspace context for path-based multi-workspace.
 * This file is intentionally separate from routes/root.tsx to avoid circular dependencies.
 * Components can safely import from here without creating import cycles.
 */
export interface WorkspaceContext {
  slug: string;
}

export const WorkspaceContextValue = createContext<WorkspaceContext | null>(
  null,
);

/**
 * Hook to get the current workspace context.
 * Must be used within a route nested under /$workspace.
 * @throws Error if used outside of workspace route
 */
export function useWorkspace(): WorkspaceContext {
  const context = useContext(WorkspaceContextValue);
  if (!context) {
    throw new Error(
      "useWorkspace must be used within a WorkspaceProvider (inside /$workspace route)",
    );
  }
  return context;
}

/**
 * Hook to optionally get the current workspace context.
 * Returns null if not within a workspace route.
 */
export function useWorkspaceOptional(): WorkspaceContext | null {
  return useContext(WorkspaceContextValue);
}

/**
 * Extract workspace slug from router state.
 * Use this in commands and other non-React contexts where hooks aren't available.
 */
export function getWorkspaceFromRouter(router: {
  state: { matches: Array<{ params: Record<string, string> }> };
}): string | null {
  // Find the workspace param from route matches
  for (const match of router.state.matches) {
    if (match.params && "workspace" in match.params) {
      return match.params.workspace;
    }
  }
  return null;
}
