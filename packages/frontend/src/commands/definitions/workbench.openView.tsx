import { IconEye } from "@tabler/icons-react";
import { ModalFrame } from "../../components/floating/modal";
import { SearchableTreeNavigator } from "../../components/navigation/searchable-tree-navigator/SearchableTreeNavigator";
import type { TreeNavigatorItem } from "../../components/navigation/searchable-tree-navigator/TreeNavigator";
import type { CommandDefinition } from "../types";

export const workbenchOpenView: CommandDefinition = {
  id: "workbench.openView",
  name: "Open View",
  icon: <IconEye />,
  execute: (context) => {
    const views = context.config?.views || {};
    const viewEntries = Object.entries(views);

    if (viewEntries.length === 0) {
      context.modal.openModal({
        content: (
          <ModalFrame>
            <div className="p-4 text-center">
              <p className="text-onSurface">No views available</p>
            </div>
          </ModalFrame>
        ),
        alignment: "top",
        size: "md",
        showBackdrop: true,
      });
      return;
    }

    const viewItems: TreeNavigatorItem[] = viewEntries.map(
      ([viewId, view]) => ({
        id: viewId,
        icon: <IconEye />,
        title: view.title || viewId,
        subtitle: `Navigate to ${viewId} view`,
        onNavigate: () => {
          context.modal.closeModal();
          context.router.navigate({
            to: "/v/$view",
            params: { view: viewId },
          });
        },
      }),
    );

    context.modal.openModal({
      content: (
        <ModalFrame>
          <SearchableTreeNavigator
            items={viewItems}
            placeHolder="Search views..."
          />
        </ModalFrame>
      ),
      alignment: "top",
      size: "lg",
      showBackdrop: true,
    });
  },
};
