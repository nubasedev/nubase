import { nu } from "@nubase/core";
import { Settings } from "lucide-react";
import { ModalFrame } from "../../components/floating/modal";
import { showToast } from "../../components/floating/toast";
import { SearchableTreeNavigator } from "../../components/navigation/searchable-tree-navigator/SearchableTreeNavigator";
import { ModalViewRenderer } from "../../components/views/ViewRenderer/modal";
import type { View } from "../../config/view";
import type { MenuItem } from "../../menu/types";
import { createCommand } from "../defineCommand";

// Schema for command arguments
const workbenchOpenResourceOperationInModalArgsSchema = nu.object({
  resourceId: nu
    .string()
    .withMeta({
      label: "Resource ID",
      description: "The ID of the resource to open",
    })
    .optional(),
  operation: nu
    .string()
    .withMeta({
      label: "Operation",
      description: "The operation to perform on the resource",
    })
    .optional(),
});

export const workbenchOpenResourceOperationInModal = createCommand({
  id: "workbench.openResourceOperationInModal",
  name: "Open Resource Operation in Modal",
  icon: Settings,
  argsSchema: workbenchOpenResourceOperationInModalArgsSchema.optional(),
  execute: (context, args) => {
    // If both resourceId and operation are provided, open the specific operation directly
    if (args?.resourceId && args?.operation) {
      const { resourceId, operation } = args;

      // Validate that the resource and view exist
      const resource = context.config?.resources?.[resourceId];
      const resourceView = resource?.views?.[operation];

      if (resourceView) {
        context.modal.openModal({
          content: (
            <ModalViewRenderer
              view={resourceView}
              context={context}
              resourceName={resourceId}
              onClose={() => context.modal.closeModal()}
              onError={(error) => {
                showToast(
                  `Error in ${resourceId} ${operation}: ${error.message}`,
                  "error",
                );
              }}
            />
          ),
          alignment: "top",
          size: "lg",
          showBackdrop: true,
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

    // Create flat list of resource views
    const viewItems: MenuItem[] = [];
    const filterView = args?.operation; // Filter by view if provided

    for (const [resourceId, resource] of resourceEntries) {
      const viewEntries = Object.entries(resource.views);

      for (const [viewId, view] of viewEntries as [string, View][]) {
        // Apply filter if view is specified
        if (!filterView || viewId === filterView) {
          viewItems.push({
            id: `${resourceId}-${viewId}`,
            icon: Settings,
            label: `${resource.id} → ${view.title}`,
            subtitle: `Open ${resourceId} ${viewId} view in modal`,
            onExecute: () => {
              // Close the current modal (the resource selector)
              context.modal.closeModal();

              // Open the actual resource view in a new modal
              context.modal.openModal({
                content: (
                  <ModalViewRenderer
                    view={view}
                    context={context}
                    resourceName={resourceId}
                    onClose={() => context.modal.closeModal()}
                    onError={(error) => {
                      showToast(
                        `Error in ${resourceId} ${viewId}: ${error.message}`,
                        "error",
                      );
                    }}
                  />
                ),
                alignment: "top",
                size: "lg",
                showBackdrop: true,
              });
            },
          });
        }
      }
    }

    // Show empty state if filter results in no items
    if (viewItems.length === 0 && filterView) {
      context.modal.openModal({
        content: (
          <ModalFrame>
            <div className="p-4 text-center">
              <p className="text-foreground">
                No "{filterView}" views available
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

    const placeholder = filterView
      ? `Search ${filterView} views...`
      : "Search resource views...";

    context.modal.openModal({
      content: (
        <ModalFrame>
          <SearchableTreeNavigator
            items={viewItems}
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
