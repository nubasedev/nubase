import { nu } from "@nubase/core";
import { PanelRightOpen } from "lucide-react";
import { ModalFrame } from "../../components/floating/modal";
import { SearchableTreeNavigator } from "../../components/navigation/searchable-tree-navigator/SearchableTreeNavigator";
import type { View } from "../../config/view";
import type { NubaseContextData } from "../../context/types";
import type { MenuItem } from "../../menu/types";
import { writeOverlay } from "../../utils/overlay-url";
import { createCommand } from "../defineCommand";

const workbenchOpenResourceOperationInDrawerArgsSchema = nu.object({
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

function openInDrawer(
  context: NubaseContextData,
  resourceId: string,
  operation: string,
) {
  const currentSearch = (context.router.state.location.search ?? {}) as Record<
    string,
    unknown
  >;
  const nextSearch = writeOverlay(currentSearch, {
    resource: resourceId,
    operation,
    params: {},
  });
  const pathname = context.router.state.location.pathname;
  context.router.navigate({
    to: pathname as any,
    search: nextSearch as any,
  });
}

export const workbenchOpenResourceOperationInDrawer = createCommand({
  id: "workbench.openResourceOperationInDrawer",
  name: "Open Resource Operation in Drawer",
  icon: PanelRightOpen,
  argsSchema: workbenchOpenResourceOperationInDrawerArgsSchema.optional(),
  execute: (context, args) => {
    if (args?.resourceId && args?.operation) {
      const { resourceId, operation } = args;

      const resource = context.config?.resources?.[resourceId];
      const resourceView = resource?.views?.[operation];

      if (resourceView) {
        openInDrawer(context, resourceId, operation);
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

    const viewItems: MenuItem[] = [];
    const filterView = args?.operation;

    for (const [resourceId, resource] of resourceEntries) {
      const viewEntries = Object.entries(resource.views);

      for (const [viewId, view] of viewEntries as [string, View][]) {
        if (!filterView || viewId === filterView) {
          viewItems.push({
            id: `${resourceId}-${viewId}`,
            icon: PanelRightOpen,
            label: `${resource.id} → ${view.title}`,
            subtitle: `Open ${resourceId} ${viewId} view in drawer`,
            onExecute: () => {
              context.modal.closeModal();
              openInDrawer(context, resourceId, viewId);
            },
          });
        }
      }
    }

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
