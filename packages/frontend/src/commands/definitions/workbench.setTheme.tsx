import { nu } from "@nubase/core";
import { Moon, Palette, Sun } from "lucide-react";
import { ModalFrame } from "../../components/floating/modal";
import { showToast } from "../../components/floating/toast";
import { SearchableTreeNavigator } from "../../components/navigation/searchable-tree-navigator/SearchableTreeNavigator";
import type { MenuItem } from "../../menu/types";
import { createCommand } from "../defineCommand";

// Schema for command arguments
const workbenchSetThemeArgsSchema = nu.object({
  themeId: nu
    .string()
    .withMeta({
      label: "Theme ID",
      description: "The ID of the theme to set",
    })
    .optional(),
});

export const workbenchSetTheme = createCommand({
  id: "workbench.setTheme",
  name: "Set Theme",
  icon: Palette,
  argsSchema: workbenchSetThemeArgsSchema.optional(),
  execute: (context, args) => {
    // If themeId is provided, set it directly
    if (args?.themeId) {
      const { themeId } = args;

      // Validate that the theme exists
      const availableThemes = context.config?.themeIds || ["light", "dark"];
      if (availableThemes.includes(themeId)) {
        context.theming.setActiveThemeId(themeId);
        return;
      }
      showToast(
        `Theme "${themeId}" not found. Available themes: ${availableThemes.join(", ")}`,
        "default",
      );
      // Fall through to show theme selection modal
    }
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

    const themeItems: MenuItem[] = sortedThemes.map((themeId) => {
      const theme = context.theming.themeMap[themeId];
      return {
        id: themeId,
        icon: theme?.type === "dark" ? Moon : Sun,
        label: theme?.name || themeId,
        subtitle: `Switch to ${themeId} theme`,
        onExecute: () => {
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
});
