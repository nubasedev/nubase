import { nu } from "@nubase/core";
import { Settings } from "lucide-react";
import { ModalFrame } from "../../components/floating/modal";
import { showToast } from "../../components/floating/toast";
import { SearchableTreeNavigator } from "../../components/navigation/searchable-tree-navigator/SearchableTreeNavigator";
import type { TreeNavigatorItem } from "../../components/navigation/searchable-tree-navigator/TreeNavigator";
import { ModalViewRenderer } from "../../components/views/ViewRenderer/modal";
import { defineCommand } from "../defineCommand";

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

export const workbenchOpenResourceOperationInModal = defineCommand({
  id: "workbench.openResourceOperationInModal",
  name: "Open Resource Operation in Modal",
  icon: <Settings />,
  argsSchema: workbenchOpenResourceOperationInModalArgsSchema.optional(),
  execute: (context, args) => {
    // If both resourceId and operation are provided, open the specific operation directly
    if (args?.resourceId && args?.operation) {
      const { resourceId, operation } = args;

      // Validate that the resource and operation exist
      const resource = context.config?.resources?.[resourceId];
      const resourceOperation = resource?.operations?.[operation];

      if (resourceOperation) {
        context.modal.openModal({
          content: (
            <ModalViewRenderer
              view={(resourceOperation as any).view}
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
      } else {
        console.warn(
          `Resource "${resourceId}" or operation "${operation}" not found`,
        );
      }
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
    const operationItems: TreeNavigatorItem[] = [];
    const filterOperation = args?.operation; // Filter by operation if provided

    for (const [resourceId, resource] of resourceEntries) {
      const operationEntries = Object.entries(resource.operations);

      for (const [operationId, operation] of operationEntries) {
        // Apply filter if operation is specified
        if (!filterOperation || operationId === filterOperation) {
          operationItems.push({
            id: `${resourceId}-${operationId}`,
            icon: <Settings />,
            title: `${resource.id} → ${(operation as any).view.title}`,
            subtitle: `Open ${resourceId} ${operationId} operation in modal`,
            onNavigate: () => {
              // Close the current modal (the resource selector)
              context.modal.closeModal();

              // Open the actual resource operation in a new modal
              context.modal.openModal({
                content: (
                  <ModalViewRenderer
                    view={(operation as any).view}
                    context={context}
                    resourceName={resourceId}
                    onClose={() => context.modal.closeModal()}
                    onError={(error) => {
                      showToast(
                        `Error in ${resourceId} ${operationId}: ${error.message}`,
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
    if (operationItems.length === 0 && filterOperation) {
      context.modal.openModal({
        content: (
          <ModalFrame>
            <div className="p-4 text-center">
              <p className="text-foreground">
                No "${filterOperation}" operations available
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
      ? `Search ${filterOperation} operations...`
      : "Search resource operations...";

    context.modal.openModal({
      content: (
        <ModalFrame>
          <SearchableTreeNavigator
            items={operationItems}
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
