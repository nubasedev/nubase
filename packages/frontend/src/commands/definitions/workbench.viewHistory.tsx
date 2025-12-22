import { Clock } from "lucide-react";
import { ModalFrame } from "../../components/floating/modal";
import { SearchableTreeNavigator } from "../../components/navigation/searchable-tree-navigator/SearchableTreeNavigator";
import type { MenuItem } from "../../menu/types";
import { createCommand } from "../defineCommand";

export const workbenchViewHistory = createCommand({
  id: "workbench.viewHistory",
  name: "View Navigation History",
  icon: Clock,
  execute: (context) => {
    const navigationHistory = context.navigationHistory;
    const history = navigationHistory.getHistory();

    if (history.length === 0) {
      context.modal.openModal({
        content: (
          <ModalFrame>
            <div className="p-4 text-center">
              <p className="text-foreground">No navigation history available</p>
            </div>
          </ModalFrame>
        ),
        alignment: "top",
        size: "md",
        showBackdrop: true,
      });
      return;
    }

    // Create menu items from history
    const historyItems: MenuItem[] = history.map((entry, index) => ({
      id: entry.id,
      icon: Clock,
      label: entry.title,
      subtitle:
        index === 0
          ? "Current page"
          : navigationHistory.formatTimeAgo(entry.timestamp),
      onExecute: () => {
        context.modal.closeModal();
        navigationHistory.navigateToEntry(entry);
      },
    }));

    context.modal.openModal({
      content: (
        <ModalFrame>
          <SearchableTreeNavigator
            items={historyItems}
            placeHolder="Search navigation history..."
          />
        </ModalFrame>
      ),
      alignment: "top",
      size: "lg",
      showBackdrop: true,
    });
  },
});
