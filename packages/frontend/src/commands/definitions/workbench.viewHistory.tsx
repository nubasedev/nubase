import { Clock } from "lucide-react";
import { ModalFrame } from "../../components/floating/modal";
import { SearchableTreeNavigator } from "../../components/navigation/searchable-tree-navigator/SearchableTreeNavigator";
import type { TreeNavigatorItem } from "../../components/navigation/searchable-tree-navigator/TreeNavigator";
import { createCommand } from "../defineCommand";

export const workbenchViewHistory = createCommand({
  id: "workbench.viewHistory",
  name: "View Navigation History",
  icon: <Clock />,
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

    // Create tree items from history
    const historyItems: TreeNavigatorItem[] = history.map((entry, index) => ({
      id: entry.id,
      icon: <Clock />,
      title: entry.title,
      subtitle:
        index === 0
          ? "Current page"
          : navigationHistory.formatTimeAgo(entry.timestamp),
      onNavigate: () => {
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
