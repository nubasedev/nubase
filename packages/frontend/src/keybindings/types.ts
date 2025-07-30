export interface ParsedKeybinding {
  /** The original key string */
  key: string;
  /** Array of key sequences for chords (e.g., ["ctrl+k", "ctrl+c"]) */
  sequences: string[];
  /** The command to execute */
  command: string;
  /** Optional arguments for the command */
  args?: Record<string, unknown>;
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
