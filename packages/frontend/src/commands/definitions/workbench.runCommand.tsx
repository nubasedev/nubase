import { IconCommand } from "@tabler/icons-react";
import { SearchableTreeNavigator } from "../../components/navigation/searchable-tree-navigator/SearchableTreeNavigator";
import type { TreeNavigatorItem } from "../../components/navigation/searchable-tree-navigator/TreeNavigator";
import type { CommandDefinition } from "../types";

export const workbenchRunCommand: CommandDefinition = {
  id: "workbench.runCommand",
  name: "Run Command",
  icon: <IconCommand />,
  execute: (context) => {
    const commands = context.commands.getAllCommands();
    const commandItems: TreeNavigatorItem[] = commands.map((command) => ({
      id: command.id,
      icon: command.icon || <IconCommand className="h-4 w-4" />,
      title: command.name,
      onNavigate: () => {
        context.modal.closeModal();
        context.commands.execute(command.id);
      },
    }));
    context.modal.openModal(
      <SearchableTreeNavigator
        items={commandItems}
        placeHolder="Search in commands..."
      />,
      {
        alignment: "top",
        size: "lg",
        showBackdrop: true,
      },
    );
  },
};
