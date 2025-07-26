import type { Action } from "../actions/types";

/**
 * Legacy parsed keybinding using string-based commands
 */
export interface ParsedCommandKeybinding {
  /** The original key string */
  key: string;
  /** Array of key sequences for chords (e.g., ["ctrl+k", "ctrl+c"]) */
  sequences: string[];
  /** The command to execute */
  command: string;
  /** Optional arguments for the command */
  commandArgs?: Record<string, unknown>;
}

/**
 * Modern parsed keybinding using typed actions
 */
export interface ParsedActionKeybinding {
  /** The original key string */
  key: string;
  /** Array of key sequences for chords (e.g., ["ctrl+k", "ctrl+c"]) */
  sequences: string[];
  /** The action to execute */
  action: Action;
}

/**
 * Union type supporting both legacy command and modern action keybindings
 */
export type ParsedKeybinding = ParsedCommandKeybinding | ParsedActionKeybinding;

/**
 * Type guard to check if a parsed keybinding uses commands
 */
export function isParsedCommandKeybinding(
  keybinding: ParsedKeybinding,
): keybinding is ParsedCommandKeybinding {
  return "command" in keybinding;
}

/**
 * Type guard to check if a parsed keybinding uses actions
 */
export function isParsedActionKeybinding(
  keybinding: ParsedKeybinding,
): keybinding is ParsedActionKeybinding {
  return "action" in keybinding;
}

export interface KeySequence {
  /** Modifier keys */
  meta?: boolean;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  /** The main key */
  key: string;
}

export interface KeybindingState {
  /** Current chord sequence being built */
  currentChord: string[];
  /** Timeout for chord completion */
  chordTimeout: number | null;
  /** Whether we're waiting for the next key in a chord */
  waitingForChord: boolean;
}
