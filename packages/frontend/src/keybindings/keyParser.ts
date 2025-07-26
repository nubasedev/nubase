import type { ActionKeybinding, Keybinding } from "../commands/types";
import type { KeySequence, ParsedKeybinding } from "./types";

/**
 * Type guard to check if a keybinding uses commands
 */
function isCommandKeybinding(keybinding: Keybinding): keybinding is {
  key: string | string[];
  command: string;
  commandArgs?: Record<string, unknown>;
} {
  return "command" in keybinding;
}

/**
 * Type guard to check if a keybinding uses actions
 */
function isActionKeybinding(
  keybinding: Keybinding,
): keybinding is ActionKeybinding {
  return "action" in keybinding;
}

/**
 * Parses a key string into a KeySequence
 * Supports VS Code format: "ctrl+alt+k", "meta+shift+p", etc.
 */
export function parseKeySequence(keyString: string): KeySequence {
  const parts = keyString.toLowerCase().split("+");
  const sequence: KeySequence = {
    key: "",
  };

  for (const part of parts) {
    switch (part.trim()) {
      case "ctrl":
      case "control":
        sequence.ctrl = true;
        break;
      case "meta":
      case "cmd":
      case "command":
        sequence.meta = true;
        break;
      case "alt":
      case "option":
        sequence.alt = true;
        break;
      case "shift":
        sequence.shift = true;
        break;
      default:
        sequence.key = part.trim();
    }
  }

  return sequence;
}

/**
 * Parses a keybinding definition into ParsedKeybinding
 * Supports chords like "ctrl+k ctrl+c" (space-separated sequences)
 * Supports alternative keys as array: ["meta+k", "ctrl+k"]
 * Supports both command-based and action-based keybindings
 */
export function parseKeybinding(keybinding: Keybinding): ParsedKeybinding[] {
  const keys = Array.isArray(keybinding.key)
    ? keybinding.key
    : [keybinding.key];

  return keys.map((keyString) => {
    // Split by spaces for chord sequences
    const sequences = keyString
      .split(/\s+/)
      .map((seq) => seq.trim())
      .filter((seq) => seq.length > 0);

    if (isActionKeybinding(keybinding)) {
      // Action-based keybinding
      return {
        key: keyString,
        sequences,
        action: keybinding.action,
      };
    } else if (isCommandKeybinding(keybinding)) {
      // Command-based keybinding (legacy)
      return {
        key: keyString,
        sequences,
        command: keybinding.command,
        commandArgs: keybinding.commandArgs,
      };
    } else {
      throw new Error("Unknown keybinding type");
    }
  });
}

/**
 * Creates a normalized key string from a KeyboardEvent
 * Matches VS Code's key format
 */
export function normalizeEventKey(event: KeyboardEvent): string {
  const parts: string[] = [];

  if (event.metaKey) parts.push("meta");
  if (event.ctrlKey) parts.push("ctrl");
  if (event.altKey) parts.push("alt");
  if (event.shiftKey) parts.push("shift");

  // Handle special keys
  let key = event.key.toLowerCase();

  // Map special keys to VS Code format
  switch (key) {
    case " ":
      key = "space";
      break;
    case "arrowup":
      key = "up";
      break;
    case "arrowdown":
      key = "down";
      break;
    case "arrowleft":
      key = "left";
      break;
    case "arrowright":
      key = "right";
      break;
    case "escape":
      key = "escape";
      break;
    case "enter":
      key = "enter";
      break;
    case "backspace":
      key = "backspace";
      break;
    case "delete":
      key = "delete";
      break;
    case "tab":
      key = "tab";
      break;
  }

  parts.push(key);
  return parts.join("+");
}

/**
 * Checks if a key sequence matches a parsed sequence
 */
export function matchesKeySequence(
  eventKey: string,
  targetSequence: string,
): boolean {
  return eventKey === targetSequence.toLowerCase();
}
