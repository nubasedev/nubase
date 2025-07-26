import type { Keybinding } from "../commands/types";
import { keybindingManager } from "./KeybindingManager";

let isListenerAttached = false;

/**
 * Registers keybindings and sets up the global keyboard event listener
 * This replaces the hook-based approach with a centralized system
 */
export function registerKeybindings(keybindings: Keybinding[]): void {
  // Register the keybindings with the manager
  keybindingManager.registerKeybindings(keybindings);

  // Attach global keyboard listener if not already attached
  if (!isListenerAttached) {
    document.addEventListener("keydown", handleGlobalKeydown, true);
    isListenerAttached = true;
  }
}

/**
 * Global keyboard event handler
 */
async function handleGlobalKeydown(event: KeyboardEvent): Promise<void> {
  await keybindingManager.handleKeyboardEvent(event);
}

/**
 * Cleans up the keybinding system
 * Call this when unmounting the app or when you want to remove all keybindings
 */
export function cleanupKeybindings(): void {
  keybindingManager.clear();

  if (isListenerAttached) {
    document.removeEventListener("keydown", handleGlobalKeydown, true);
    isListenerAttached = false;
  }
}

/**
 * Updates keybindings without removing the global listener
 * Useful for hot-reloading keybinding configurations
 */
export function updateKeybindings(keybindings: Keybinding[]): void {
  keybindingManager.registerKeybindings(keybindings);
}
