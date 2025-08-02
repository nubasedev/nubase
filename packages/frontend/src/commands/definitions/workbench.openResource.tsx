import { IconDatabase, IconFolder } from "@tabler/icons-react";
import { ModalFrame } from "../../components/floating/modal";
import { SearchableTreeNavigator } from "../../components/navigation/searchable-tree-navigator/SearchableTreeNavigator";
import type { TreeNavigatorItem } from "../../components/navigation/searchable-tree-navigator/TreeNavigator";
import type { CommandDefinition } from "../types";

export const workbenchOpenResource: CommandDefinition = {
  id: "workbench.openResource",
  name: "Open Resource",
  icon: <IconDatabase />,
  execute: (context) => {
    const resources = context.config?.resources || {};
    const resourceEntries = Object.entries(resources);

    if (resourceEntries.length === 0) {
      context.modal.openModal({
        content: (
          <ModalFrame>
            <div className="p-4 text-center">
              <p className="text-onSurface">No resources available</p>
            </div>
          </ModalFrame>
        ),
        alignment: "top",
        size: "md",
        showBackdrop: true,
      });
      return;
    }

    // Create nested items: resources and their operations
    const resourceItems: TreeNavigatorItem[] = [];

    for (const [resourceId, resource] of resourceEntries) {
      const operations = Object.entries(resource.operations || {});

      if (operations.length === 0) {
        // Resource with no operations
        resourceItems.push({
          id: resourceId,
          icon: <IconDatabase />,
          title: resourceId,
          subtitle: "No operations available",
        });
      } else {
        // Add operations as separate items
        for (const [operationId, _operation] of operations) {
          resourceItems.push({
            id: `${resourceId}.${operationId}`,
            icon: <IconFolder />,
            title: `${resourceId} - ${operationId}`,
            subtitle: `${operationId} operation for ${resourceId}`,
            onNavigate: () => {
              context.modal.closeModal();
              context.router.navigate({
                to: "/r/$resourceName/$operation",
                params: {
                  resourceName: resourceId,
                  operation: operationId,
                },
              });
            },
          });
        }
      }
    }

    context.modal.openModal({
      content: (
        <ModalFrame>
          <SearchableTreeNavigator
            items={resourceItems}
            placeHolder="Search resources..."
          />
        </ModalFrame>
      ),
      alignment: "top",
      size: "lg",
      showBackdrop: true,
    });
  },
};
