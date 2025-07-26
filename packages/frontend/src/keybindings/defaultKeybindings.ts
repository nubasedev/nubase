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
   * List of command IDs to remove from defaults
   * More explicit and works better with action-based keybindings
   */
  removeCommands?: string[];
}

/**
 * Helper to get the identifier from a keybinding (command or action ID)
 */
function getKeybindingIdentifier(keybinding: Keybinding): string {
  if ("command" in keybinding) {
    return keybinding.command;
  } else if ("action" in keybinding) {
    return keybinding.action.id;
  }
  throw new Error("Unknown keybinding type");
}

/**
 * Creates an extended keybinding configuration from the defaults
 * @param options Configuration for extending keybindings
 * @returns Array of keybindings with extensions applied
 */
function extendKeybindings(
  options: KeybindingExtendOptions = {},
): Keybinding[] {
  const { add = [], removeCommands = [] } = options;

  // Start with defaults
  let result = [...DEFAULT_KEYBINDINGS];

  // Remove commands explicitly
  if (removeCommands.length > 0) {
    result = result.filter((binding) => {
      const identifier = getKeybindingIdentifier(binding);
      return !removeCommands.includes(identifier);
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
   * // Add a new action-based keybinding (recommended)
   * const keybindings = defaultKeybindings.extend({
   *   add: [{
   *     key: "meta+/",
   *     action: createCommandAction({ id: "theme-toggle" }, workbenchSetTheme)
   *   }]
   * });
   *
   * @example
   * // Add a legacy command-based keybinding
   * const keybindings = defaultKeybindings.extend({
   *   add: [{ key: "meta+/", command: "workbench.setTheme", commandArgs: {} }]
   * });
   *
   * @example
   * // Remove default keybindings and add custom ones
   * const keybindings = defaultKeybindings.extend({
   *   removeCommands: ["workbench.runCommand"],
   *   add: [{
   *     key: "meta+shift+p",
   *     action: createCommandAction({ id: "custom-cmd" }, myCustomCommand)
   *   }]
   * });
   */
  extend: extendKeybindings,
};
