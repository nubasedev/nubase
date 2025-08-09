import { Moon, Palette, Sun } from "lucide-react";
import { ModalFrame } from "../../components/floating/modal";
import { SearchableTreeNavigator } from "../../components/navigation/searchable-tree-navigator/SearchableTreeNavigator";
import type { TreeNavigatorItem } from "../../components/navigation/searchable-tree-navigator/TreeNavigator";
import type { CommandDefinition } from "../types";

export const workbenchSetTheme: CommandDefinition = {
  id: "workbench.setTheme",
  name: "Set Theme",
  icon: <Palette />,
  execute: (context) => {
    // Get available themes from context or use defaults
    const availableThemes = context.config?.themeIds || ["light", "dark"];

    // We need the original theme to revert back if the modal is dismissed
    const originalTheme = context.theming.activeThemeId;

    // Sort themes: current theme first, then others alphabetically
    const currentTheme = context.theming.activeThemeId;
    const otherThemes = availableThemes
      .filter((themeId) => themeId !== currentTheme)
      .sort((a, b) => a.localeCompare(b));
    const sortedThemes = [currentTheme, ...otherThemes];

    const themeItems: TreeNavigatorItem[] = sortedThemes.map((themeId) => {
      const theme = context.theming.themeMap[themeId];
      return {
        id: themeId,
        icon: theme?.type === "dark" ? <Moon /> : <Sun />,
        title: theme?.name || themeId,
        subtitle: `Switch to ${themeId} theme`,
        onNavigate: () => {
          context.modal.closeModal();
          context.theming.setActiveThemeId(themeId);
        },
        onFocus: () => {
          // Preview the theme when focused
          context.theming.setActiveThemeId(themeId);
        },
      };
    });

    context.modal.openModal({
      content: (
        <ModalFrame>
          <SearchableTreeNavigator
            items={themeItems}
            placeHolder="Search themes..."
          />
        </ModalFrame>
      ),
      alignment: "top",
      size: "lg",
      showBackdrop: true,
      onDismiss: () => {
        // Revert to the original theme if modal is dismissed
        context.theming.setActiveThemeId(originalTheme);
      },
    });
  },
};
