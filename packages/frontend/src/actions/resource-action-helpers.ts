import { PlusIcon, TrashIcon } from "lucide-react";
import type { ReactNode } from "react";
import { workbenchOpenResourceOperationInDrawer } from "../commands/definitions/workbench.openResourceInDrawer";
import { showToast } from "../components/floating/toast/toastUtils";
import type { InlineResourceActionConfig } from "../config/create-resource-factory";
import type { NubaseContextData } from "../context/types";

/**
 * Factories for the two CRUD actions almost every resource repeats — Delete and
 * Create. They return plain `InlineResourceActionConfig` objects, so they drop
 * straight into a resource's `.withActions({ ... })` without changing how
 * actions work; they only remove the per-resource boilerplate (confirm copy,
 * bulk iteration, event emission, toasts).
 *
 * Naming note: the lower-level `createResourceAction` in `./createResourceAction`
 * builds an arbitrary resource action. These helpers are higher-level,
 * opinionated shortcuts for the two standard CRUD actions.
 */

export type DeleteActionOptions<TApiEndpoints> = {
  /** Resource name used in the `resource.deleted` event payload and as the default noun. */
  resourceName: string;
  /** Singular noun for messages; defaults to `resourceName`. */
  noun?: string;
  /** Plural noun for messages; defaults to `${noun}s`. */
  nounPlural?: string;
  /** Optional override of the confirmation dialog body. */
  confirmContent?: (args: { count: number; noun: string }) => ReactNode;
  /**
   * Deletes a single record by id. The caller supplies the typed endpoint call
   * (e.g. `context.http.deleteTicket(...)`); keeping the HTTP shape here rather
   * than inside the helper is what preserves end-to-end endpoint type-safety.
   */
  deleteOne: (args: {
    id: string | number;
    context: NubaseContextData<TApiEndpoints>;
  }) => Promise<unknown>;
};

/**
 * Builds a destructive, selection-scoped "Delete" action that confirms, deletes
 * every selected id via `deleteOne`, emits one `resource.deleted` event per id,
 * then shows a single success/error toast.
 *
 * The per-id `resource.deleted` emission is the load-bearing part: the event
 * bridge turns those events into query invalidation (so the table refreshes) and
 * any open overlay drawer showing a deleted record closes itself. Centralizing
 * it here means every resource gets that behavior for free — it's an easy thing
 * to forget when hand-rolling a delete action.
 *
 * @example
 * delete: deleteAction({
 *   resourceName: "ticket",
 *   deleteOne: ({ id, context }) =>
 *     context.http.deleteTicket({ params: { id: Number(id) } }),
 * }),
 */
export function deleteAction<TApiEndpoints = any>(
  options: DeleteActionOptions<TApiEndpoints>,
): InlineResourceActionConfig<TApiEndpoints> {
  const { resourceName, deleteOne, confirmContent } = options;
  const noun = options.noun ?? resourceName;
  const nounPlural = options.nounPlural ?? `${noun}s`;
  const pluralize = (count: number) => (count === 1 ? noun : nounPlural);

  return {
    label: "Delete",
    icon: TrashIcon,
    variant: "destructive",
    confirm: ({ selectedIds }) => {
      const count = selectedIds.length;
      const word = pluralize(count);
      return {
        title: `Delete ${count} ${word}`,
        content: confirmContent
          ? confirmContent({ count, noun: word })
          : `Are you sure you want to delete ${count} ${word}? This action cannot be undone.`,
      };
    },
    onExecute: async ({ selectedIds, context }) => {
      const count = selectedIds.length;
      const word = pluralize(count);
      try {
        // Delete all selected records concurrently.
        await Promise.all(selectedIds.map((id) => deleteOne({ id, context })));
        // One event per record so listeners can react per-id — the event bridge
        // invalidates the resource's queries and any overlay drawer showing one
        // of these records closes itself.
        for (const id of selectedIds) {
          context.events.emit("resource.deleted", {
            resourceName,
            resourceId: id,
            source: "form",
          });
        }
        // Single, count-aware toast for the whole operation. The default
        // notification rule for `resource.deleted` is intentionally silent so
        // this handler-owned message isn't duplicated.
        showToast(`${count} ${word} deleted successfully`, "default");
      } catch (error) {
        console.error(`Error deleting ${nounPlural}:`, error);
        showToast(`Failed to delete ${word}`, "error");
      }
    },
  };
}

export type CreateActionOptions = {
  /** Resource id whose `create` view should open in the drawer. */
  resourceName: string;
  /** Button label; defaults to "Create". */
  label?: string;
};

/**
 * Builds a global "Create" action that opens the resource's `create` view in the
 * overlay drawer (via the workbench command) instead of navigating away.
 *
 * @example
 * create: createAction({ resourceName: "ticket" }),
 */
export function createAction<TApiEndpoints = any>(
  options: CreateActionOptions,
): InlineResourceActionConfig<TApiEndpoints> {
  const { resourceName, label = "Create" } = options;
  return {
    label,
    icon: PlusIcon,
    // Global: always enabled and independent of the current row selection.
    scope: "global",
    onExecute: async ({ context }) => {
      await context.commands.execute(
        workbenchOpenResourceOperationInDrawer.id,
        {
          resourceId: resourceName,
          operation: "create",
        },
      );
    },
  };
}
