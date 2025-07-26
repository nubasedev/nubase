import { injectThemeVariables } from "../../theming/runtime-theme-generator";
import type { NubaseTheme } from "../../theming/theme";

/**
 * Initializes styles by injecting CSS variables derived from themes
 */
export async function initializeStyles(themes: NubaseTheme[]): Promise<void> {
  try {
    // Inject the CSS variables into the DOM
    injectThemeVariables(themes);
  } catch (error) {
    console.error("Failed to initialize styles:", error);
    throw error;
  }
}
