import { Folder } from "lucide-react";
import { ModalFrame } from "../components/floating/modal";
import { SearchableTreeNavigator } from "../components/navigation/searchable-tree-navigator/SearchableTreeNavigator";
import type { NubaseContextData } from "../context/types";
import type { MenuItem } from "../menu/types";

export type PickResourceOperationOptions = {
  filterOperation?: string;
  onSelect: (resourceId: string, operation: string) => void;
};

export function pickResourceOperation(
  context: NubaseContextData,
  options: PickResourceOperationOptions,
): void {
  const { filterOperation, onSelect } = options;
  const resources = context.config?.resources ?? {};
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

  const items: MenuItem[] = [];
  for (const [resourceId, resource] of resourceEntries) {
    for (const viewId of Object.keys(resource.views ?? {})) {
      if (filterOperation && viewId !== filterOperation) continue;
      items.push({
        id: `${resourceId}.${viewId}`,
        icon: Folder,
        label: `${resourceId} - ${viewId}`,
        subtitle: `${viewId} view for ${resourceId}`,
        onExecute: () => {
          context.modal.closeModal();
          onSelect(resourceId, viewId);
        },
      });
    }
  }

  if (items.length === 0) {
    const message = filterOperation
      ? `No "${filterOperation}" views available`
      : "No resource views available";
    context.modal.openModal({
      content: (
        <ModalFrame>
          <div className="p-4 text-center">
            <p className="text-foreground">{message}</p>
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
        <SearchableTreeNavigator items={items} placeHolder={placeholder} />
      </ModalFrame>
    ),
    alignment: "top",
    size: "lg",
    showBackdrop: true,
  });
}
