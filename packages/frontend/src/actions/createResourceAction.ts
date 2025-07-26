import type React from "react";
import type { ResourceAction, ResourceActionExecutionContext } from "./types";

/**
 * Configuration for creating a resource action
 */
export interface CreateResourceActionConfig {
  id: string;
  label?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  disabled?: boolean;
  variant?: "default" | "destructive";
  onExecute: (context: ResourceActionExecutionContext) => void | Promise<void>;
}

/**
 * Helper function to create a type-safe resource action.
 * Resource actions operate on selected resources and receive the resource type and selected IDs.
 *
 * @param config - Configuration for the resource action
 * @returns A properly typed ResourceAction
 *
 * @example
 * ```typescript
 * const deleteTicketsAction = createResourceAction({
 *   id: "delete-tickets",
 *   label: "Delete Selected",
 *   icon: TrashIcon,
 *   variant: "destructive",
 *   onExecute: async ({ selectedIds, context }) => {
 *     // Bulk delete the selected tickets
 *     await Promise.all(
 *       selectedIds.map(id => context.http.deleteTicket({ params: { id } }))
 *     );
 *     showToast(`Deleted ${selectedIds.length} tickets`, "success");
 *   },
 * });
 * ```
 */
export function createResourceAction(
  config: CreateResourceActionConfig,
): ResourceAction {
  return {
    type: "resource",
    id: config.id,
    label: config.label,
    icon: config.icon,
    disabled: config.disabled,
    variant: config.variant || "default",
    onExecute: config.onExecute,
  };
}
