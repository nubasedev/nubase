# Actions System

This document explains how Nubase wires actions through the frontend stack. It focuses on the infrastructure that powers bulk/table actions, row actions, and command-based actions.

## Action Taxonomy

Actions all implement the shared `Action` union (`packages/frontend/src/actions/types.ts`):

- **Handler actions** – `type: "handler"`, execute inline logic with optional `rowData`/`context`.
- **Command actions** – `type: "command"`, proxy to the command registry and benefit from schema-validated arguments.
- **Resource actions** – `type: "resource"`, operate on the selected resource ids and always run inside a `ResourceContext`.

Every concrete action carries shared metadata (label, icon, variant) so UI components can render consistent menus and toolbars.

## Declaring Actions

Most actions come from the resource builder:

```ts
// examples/questlog/frontend/src/resources/ticket.ts
export const ticketResource = createResource("ticket")
  .withApiEndpoints(apiEndpoints)
  .withActions({
    delete: {
      label: "Delete",
      variant: "destructive",
      onExecute: async ({ selectedIds, context }) => {
        await Promise.all(
          selectedIds.map((id) =>
            context.http.deleteTicket({ params: { id: Number(id) } }),
          ),
        );
      },
    },
  })
  .withViews({
    search: {
      type: "resource-search",
      rowActions: ["delete"],      // row-level menu
      tableActions: ["delete"],    // bulk toolbar
      …
    },
  });
```

`withActions` captures inline configs, and `create-resource-factory` materializes them into `ResourceAction` instances when `withViews` is called (see `packages/frontend/src/config/create-resource-factory.ts:224-287`).

For ad-hoc use outside the builder there is also `createResourceAction` (`packages/frontend/src/actions/createResourceAction.ts`) which returns a ready-to-use `ResourceAction`.

### Action Layouts

Views reference actions by id through `ActionLayout` arrays (row/table actions accept the same `"separator"` token). `ResourceSearchViewRenderer` resolves these layouts into actual `Action` objects via `resource.actions`, which preserves type-safety and keeps view configs declarative.

## Runtime Plumbing

### Context bootstrap

`useCreateNubaseContext` (`packages/frontend/src/components/nubase-app/useCreateNubaseContext.ts`) initializes the global `NubaseContextData` and injects:

- `commands`: the shared `CommandRegistry`
- `resourceActions`: a singleton `ResourceActionsExecutor`
- routing, HTTP client, modal/dialog providers, query client, and theming information

The hook immediately calls `commandRegistry.setContext(nubaseContextData)` and `resourceActionsExecutor.setContext(nubaseContextData)` so later execution paths always have access to the same runtime data.

### ResourceActionsExecutor

`ResourceActionsExecutor` (`packages/frontend/src/actions/ResourceActionsExecutor.ts`) is a thin layer that guards `disabled` flags, injects `resourceType/selectedIds/context`, and centralizes error logging. It is the only piece responsible for invoking `onExecute` on `ResourceAction`s, which keeps hooks/components decoupled from resource-specific logic.

## Search View Integration

`ResourceSearchViewRenderer` (`packages/frontend/src/components/views/ViewRenderer/screen/ResourceSearchViewRenderer.tsx`) binds everything together:

- Wraps the grid in `ResourceContextProvider`, storing the current resource id and selected row ids.
- Builds a `SelectColumn` so bulk actions know which rows are active.
- Adds an `Action` column when `rowActions` exist. The underlying `ActionCellFormatter` renders the dropdown UI and dispatches actions using `executeAction`.
- Computes toolbar (`tableActions`) actions, disabling them automatically when `selectedRows.size === 0`.
- Wraps handler/resource actions with query invalidation so successful operations always refresh the current search query.

### executeAction bridge

`executeAction` (`packages/frontend/src/actions/executeAction.ts`) is the generic dispatcher used by grids, toolbars, and keybindings. It switches by `action.type`:

- **Handler** – calls `onExecute()` directly.
- **Command** – enforces that the Nubase context is available, then calls `context.commands.execute(...)`.
- **Resource** – confirms both Nubase context and `ResourceContextData` exist, then proxies to `context.resourceActions.execute(...)`.

This indirection makes action execution reusable outside React (e.g., keyboard shortcuts) and keeps UI components declarative.

## Command Actions

Command actions rely on the central `CommandRegistry` (`packages/frontend/src/commands/CommandRegistry.ts`):

1. Commands are defined with `createCommand`, optionally taking a Nubase schema as `argsSchema`.
2. `initializeNubaseApp` registers built-in commands, so they’re available as soon as the frontend context finishes loading (`packages/frontend/src/components/nubase-app/initializeNubaseApp.ts`).
3. When `context.commands.execute` runs, it validates args (if a schema exists) and passes the context + parsed args to the command’s `execute` handler.

Example: `workbench.openResourceOperationInModal` (`packages/frontend/src/commands/definitions/workbench.openResourceInModal.tsx`) accepts `{ resourceId, operation }` and renders the requested view inside a modal via `ModalViewRenderer`.

## Bulk vs Row Actions

| Aspect          | Row actions                                   | Table actions                               |
|-----------------|-----------------------------------------------|---------------------------------------------|
| UI              | Dropdown per row                              | `ActionBar` toolbar                         |
| Trigger context | Single-row `selectedIds` set (one id)         | `selectedRows` set from the grid selection  |
| Typical use     | View / duplicate / row-scoped commands        | Delete, assign, export                      |
| Selections      | Driven by `ActionCellFormatter` logic         | Driven by `ResourceContextProvider` state   |

Both variants ultimately call into `executeAction`, so handler/command/resource logic stays identical.

## Best Practices

1. **Respect selection semantics** – Resource actions should read from `selectedIds` (first id for single-row operations, entire array for bulk).
2. **Leverage command actions for cross-cutting behavior** – They integrate with keybindings and command palettes automatically.
3. **Surface errors via toasts/dialogs** – keep UI feedback consistent by reusing `showToast` and `context.dialog`.
4. **Invalidate data** – Search views already wrap actions to invalidate queries, but standalone usages should call `context.queryClient.invalidateQueries` when mutating data.
5. **Encapsulate complex logic** – Use helper functions or dedicated modules for multi-step mutations so action handlers remain readable.

Understanding these internals makes it easier to add new action surfaces (e.g., global shortcuts, custom toolbars) while staying aligned with Nubase’s architecture.
