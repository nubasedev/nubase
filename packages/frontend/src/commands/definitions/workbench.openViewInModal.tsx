import { IconEyeCheck } from "@tabler/icons-react";
import { SearchableTreeNavigator } from "../../components/navigation/searchable-tree-navigator/SearchableTreeNavigator";
import type { TreeNavigatorItem } from "../../components/navigation/searchable-tree-navigator/TreeNavigator";
import { NubaseContextProvider } from "../../components/nubase-app/NubaseContextProvider";
import { ViewRenderer } from "../../components/views/ViewRenderer/ViewRenderer";
import type { CommandDefinition } from "../types";

export const workbenchOpenViewInModal: CommandDefinition = {
  id: "workbench.openViewInModal",
  name: "Open View in Modal",
  icon: <IconEyeCheck />,
  execute: (context) => {
    const views = context.config?.views || {};
    const viewEntries = Object.entries(views);

    if (viewEntries.length === 0) {
      context.modal.openModal(
        <div className="p-4 text-center">
          <p className="text-onSurface">No views available</p>
        </div>,
        {
          alignment: "top",
          size: "md",
          showBackdrop: true,
        },
      );
      return;
    }

    const viewItems: TreeNavigatorItem[] = viewEntries.map(
      ([viewId, view]) => ({
        id: viewId,
        icon: <IconEyeCheck />,
        title: view.title || viewId,
        subtitle: `Open ${viewId} view in modal`,
        onNavigate: () => {
          context.modal.closeModal();
          context.modal.openModal(
            <NubaseContextProvider context={context}>
              <ViewRenderer view={view} />
            </NubaseContextProvider>,
            {
              alignment: "center",
              size: "xl",
              showBackdrop: true,
            },
          );
        },
      }),
    );

    context.modal.openModal(
      <SearchableTreeNavigator
        items={viewItems}
        placeHolder="Search views to open in modal..."
      />,
      {
        alignment: "top",
        size: "lg",
        showBackdrop: true,
      },
    );
  },
};
