import type { Keybinding } from "../commands/types";

/**
 * Default keybindings for Nubase applications
 * These provide core functionality that most apps will want
 */
const DEFAULT_KEYBINDINGS: Keybinding[] = [
  {
    key: ["meta+k", "ctrl+k"],
    command: "workbench.runCommand",
    commandArgs: {},
  },
];

/**
 * Keybinding extend options
 */
export interface KeybindingExtendOptions {
  /**
   * Additional keybindings to add
   */
  add?: Keybinding[];
  /**
   * Override existing keybindings by command
   * Set to null to remove a keybinding entirely
   */
  override?: Record<string, Keybinding | null>;
}

/**
 * Creates an extended keybinding configuration from the defaults
 * @param options Configuration for extending keybindings
 * @returns Array of keybindings with extensions applied
 */
function extendKeybindings(
  options: KeybindingExtendOptions = {},
): Keybinding[] {
  const { add = [], override = {} } = options;

  // Start with defaults
  let result = [...DEFAULT_KEYBINDINGS];

  // Apply overrides
  if (Object.keys(override).length > 0) {
    result = result.filter((binding) => {
      const overrideValue = override[binding.command];
      // If override is null, remove the keybinding
      return overrideValue !== null;
    });

    // Add replacement keybindings for overrides that aren't null
    Object.entries(override).forEach(([command, replacement]) => {
      if (replacement !== null) {
        // Remove any existing binding for this command first
        result = result.filter((binding) => binding.command !== command);
        // Add the replacement
        result.push(replacement);
      }
    });
  }

  // Add new keybindings
  result.push(...add);

  return result;
}

/**
 * Default keybindings object with extend functionality
 */
export const defaultKeybindings = {
  /**
   * Get the default keybindings array
   */
  get(): Keybinding[] {
    return [...DEFAULT_KEYBINDINGS];
  },

  /**
   * Extend the default keybindings with additional or overridden bindings
   * @param options Configuration for extending keybindings
   * @returns Array of keybindings with extensions applied
   *
   * @example
   * // Add a new keybinding
   * const keybindings = defaultKeybindings.extend({
   *   add: [{ key: "meta+/", command: "workbench.setTheme", args: {} }]
   * });
   *
   * @example
   * // Override an existing keybinding
   * const keybindings = defaultKeybindings.extend({
   *   override: {
   *     "workbench.runCommand": { key: "meta+shift+p", command: "workbench.runCommand", args: {} }
   *   }
   * });
   *
   * @example
   * // Remove a default keybinding
   * const keybindings = defaultKeybindings.extend({
   *   override: {
   *     "workbench.runCommand": null
   *   }
   * });
   */
  extend: extendKeybindings,
};
