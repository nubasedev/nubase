import { Terminal } from "lucide-react";
import { ModalFrame } from "../../components/floating/modal";
import { SearchableTreeNavigator } from "../../components/navigation/searchable-tree-navigator/SearchableTreeNavigator";
import type { MenuItem } from "../../menu/types";
import { createCommand } from "../defineCommand";

export const workbenchRunCommand = createCommand({
  id: "workbench.runCommand",
  name: "Run Command",
  icon: Terminal,
  execute: (context) => {
    const commands = context.commands.getAllCommands();
    const commandItems: MenuItem[] = commands.map((command) => ({
      id: command.id,
      icon: command.icon || Terminal,
      label: command.name,
      onExecute: () => {
        context.modal.closeModal();
        context.commands.execute(command.id);
      },
    }));
    context.modal.openModal({
      content: (
        <ModalFrame>
          <SearchableTreeNavigator
            items={commandItems}
            placeHolder="Search in commands..."
          />
        </ModalFrame>
      ),
      alignment: "top",
      size: "lg",
      showBackdrop: true,
    });
  },
});
