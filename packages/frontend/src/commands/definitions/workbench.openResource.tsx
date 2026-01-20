import { nu } from "@nubase/core";
import { Database, Folder } from "lucide-react";
import { ModalFrame } from "../../components/floating/modal";
import { SearchableTreeNavigator } from "../../components/navigation/searchable-tree-navigator/SearchableTreeNavigator";
import { getWorkspaceFromRouter } from "../../context/WorkspaceContext";
import type { MenuItem } from "../../menu/types";
import { createCommand } from "../defineCommand";

// Schema for command arguments
const workbenchOpenResourceOperationArgsSchema = nu.object({
  resourceId: nu
    .string()
    .withComputedMeta({
      label: "Resource ID",
      description: "The ID of the resource to open",
    })
    .optional(),
  operation: nu
    .string()
    .withComputedMeta({
      label: "Operation",
      description: "The operation to perform on the resource",
    })
    .optional(),
});

export const workbenchOpenResourceOperation = createCommand({
  id: "workbench.openResourceOperation",
  name: "Open Resource Operation",
  icon: Database,
  argsSchema: workbenchOpenResourceOperationArgsSchema.optional(),
  execute: (context, args) => {
    // Get current workspace from router state for path-based multi-workspace
    const workspace = getWorkspaceFromRouter(context.router);

    // If both resourceId and operation are provided, navigate directly
    if (args?.resourceId && args?.operation) {
      const { resourceId, operation } = args;

      // Validate that the resource and view exist
      const resource = context.config?.resources?.[resourceId];
      if (resource?.views?.[operation]) {
        context.router.navigate({
          to: "/$workspace/r/$resourceName/$operation",
          params: {
            workspace: workspace || "",
            resourceName: resourceId,
            operation: operation,
          },
        });
        return;
      }
      console.warn(`Resource "${resourceId}" or view "${operation}" not found`);
    }
    const resources = context.config?.resources || {};
    const resourceEntries = Object.entries(resources);

    if (resourceEntries.length === 0) {
      context.modal.openModal({
        content: (
          <ModalFrame>
            <div className="p-4 text-center">
              <p className="text-foreground">No resources available</p>
            </div>
          </ModalFrame>
        ),
        alignment: "top",
        size: "md",
        showBackdrop: true,
      });
      return;
    }

    // Create flat list of resource operations
    const resourceItems: MenuItem[] = [];
    const filterOperation = args?.operation; // Filter by operation if provided

    for (const [resourceId, resource] of resourceEntries) {
      const views = Object.entries(resource.views || {});

      if (views.length === 0) {
        // Skip resources with no views when filtering
        if (!filterOperation) {
          resourceItems.push({
            id: resourceId,
            icon: Database,
            label: resourceId,
            subtitle: "No views available",
          });
        }
      } else {
        // Add views as separate items, filtered if operation is specified
        for (const [viewId, _view] of views) {
          // Apply filter if operation is specified
          if (!filterOperation || viewId === filterOperation) {
            resourceItems.push({
              id: `${resourceId}.${viewId}`,
              icon: Folder,
              label: `${resourceId} - ${viewId}`,
              subtitle: `${viewId} view for ${resourceId}`,
              onExecute: () => {
                context.modal.closeModal();
                context.router.navigate({
                  to: "/$workspace/r/$resourceName/$operation",
                  params: {
                    workspace: workspace || "",
                    resourceName: resourceId,
                    operation: viewId,
                  },
                });
              },
            });
          }
        }
      }
    }

    // Show empty state if filter results in no items
    if (resourceItems.length === 0 && filterOperation) {
      context.modal.openModal({
        content: (
          <ModalFrame>
            <div className="p-4 text-center">
              <p className="text-foreground">
                No "{filterOperation}" views available
              </p>
            </div>
          </ModalFrame>
        ),
        alignment: "top",
        size: "md",
        showBackdrop: true,
      });
      return;
    }

    const placeholder = filterOperation
      ? `Search ${filterOperation} views...`
      : "Search resources...";

    context.modal.openModal({
      content: (
        <ModalFrame>
          <SearchableTreeNavigator
            items={resourceItems}
            placeHolder={placeholder}
          />
        </ModalFrame>
      ),
      alignment: "top",
      size: "lg",
      showBackdrop: true,
    });
  },
});
