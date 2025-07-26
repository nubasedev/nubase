import { executeAction } from "../actions/executeAction";
import { commandRegistry } from "../commands/CommandRegistry";
import type { Keybinding } from "../commands/types";
import type { NubaseContextData } from "../context/types";
import {
  matchesKeySequence,
  normalizeEventKey,
  parseKeybinding,
} from "./keyParser";
import type { KeybindingState, ParsedKeybinding } from "./types";
import { isParsedActionKeybinding, isParsedCommandKeybinding } from "./types";

/**
 * Manages keybindings with VS Code-style syntax support including chords
 */
class KeybindingManager {
  private keybindings: ParsedKeybinding[] = [];
  private state: KeybindingState = {
    currentChord: [],
    chordTimeout: null,
    waitingForChord: false,
  };
  private context: NubaseContextData | null = null;

  // Chord timeout duration (ms) - matches VS Code's behavior
  private readonly CHORD_TIMEOUT = 1000;

  /**
   * Sets the Nubase context for action execution
   */
  setContext(context: NubaseContextData | null): void {
    this.context = context;
  }

  /**
   * Registers an array of keybindings
   */
  registerKeybindings(keybindings: Keybinding[]): void {
    // Clear existing keybindings
    this.keybindings = [];
    this.resetChordState();

    // Parse and register new keybindings
    for (const keybinding of keybindings) {
      const parsedKeybindings = parseKeybinding(keybinding);
      this.keybindings.push(...parsedKeybindings);
    }
  }

  /**
   * Handles keyboard events and executes matching commands
   */
  async handleKeyboardEvent(event: KeyboardEvent): Promise<boolean> {
    // Don't handle events in input fields unless specifically configured
    const target = event.target as HTMLElement;
    if (this.shouldIgnoreEvent(target)) {
      return false;
    }

    const eventKey = normalizeEventKey(event);

    // If we're waiting for a chord, try to complete it
    if (this.state.waitingForChord) {
      return await this.handleChordCompletion(event, eventKey);
    }

    // Look for matching keybindings
    const matches = this.findMatches(eventKey);

    if (matches.length === 0) {
      return false;
    }

    // If there's an exact single-sequence match, execute it
    const exactMatch = matches.find(
      (match) =>
        match.sequences.length === 1 &&
        match.sequences[0] &&
        matchesKeySequence(eventKey, match.sequences[0]),
    );

    if (exactMatch && matches.length === 1) {
      event.preventDefault();
      event.stopPropagation();
      await this.executeKeybinding(exactMatch);
      return true;
    }

    // Check if any matches require multiple sequences (chords)
    const chordMatches = matches.filter((match) => match.sequences.length > 1);

    if (chordMatches.length > 0) {
      // Start chord sequence
      event.preventDefault();
      event.stopPropagation();
      this.startChordSequence(eventKey);
      return true;
    }

    // If we have an exact single match among multiple possibilities
    if (exactMatch) {
      event.preventDefault();
      event.stopPropagation();
      await this.executeKeybinding(exactMatch);
      return true;
    }

    return false;
  }

  /**
   * Finds all keybindings that could match the current key
   */
  private findMatches(eventKey: string): ParsedKeybinding[] {
    return this.keybindings.filter((binding) =>
      binding.sequences.some((seq, index) => {
        if (index === 0) {
          return matchesKeySequence(eventKey, seq);
        }
        return false;
      }),
    );
  }

  /**
   * Handles completion of a chord sequence
   */
  private async handleChordCompletion(
    event: KeyboardEvent,
    eventKey: string,
  ): Promise<boolean> {
    const currentSequenceIndex = this.state.currentChord.length;

    // Find keybindings that match our current chord progress
    const potentialMatches = this.keybindings.filter((binding) => {
      // Must have more sequences than our current progress
      if (binding.sequences.length <= currentSequenceIndex) {
        return false;
      }

      // All previous sequences must match our chord history
      for (let i = 0; i < currentSequenceIndex; i++) {
        const chordKey = this.state.currentChord[i];
        const bindingSeq = binding.sequences[i];
        if (
          !chordKey ||
          !bindingSeq ||
          !matchesKeySequence(chordKey, bindingSeq)
        ) {
          return false;
        }
      }

      // Current key must match the next sequence
      const nextSequence = binding.sequences[currentSequenceIndex];
      return nextSequence ? matchesKeySequence(eventKey, nextSequence) : false;
    });

    if (potentialMatches.length === 0) {
      // No matches, reset chord state
      this.resetChordState();
      return false;
    }

    event.preventDefault();
    event.stopPropagation();

    // Add current key to chord history
    this.state.currentChord.push(eventKey);

    // Check if any match is complete
    const completeMatch = potentialMatches.find(
      (match) => match.sequences.length === this.state.currentChord.length,
    );

    if (completeMatch) {
      // Execute the completed chord
      await this.executeKeybinding(completeMatch);
      this.resetChordState();
      return true;
    }

    // Continue waiting for more keys in the chord
    this.resetChordTimeout();
    return true;
  }

  /**
   * Starts a new chord sequence
   */
  private startChordSequence(eventKey: string): void {
    this.state.currentChord = [eventKey];
    this.state.waitingForChord = true;
    this.resetChordTimeout();
  }

  /**
   * Resets the chord timeout
   */
  private resetChordTimeout(): void {
    if (this.state.chordTimeout) {
      window.clearTimeout(this.state.chordTimeout);
    }

    this.state.chordTimeout = window.setTimeout(() => {
      this.resetChordState();
    }, this.CHORD_TIMEOUT);
  }

  /**
   * Resets the chord state
   */
  private resetChordState(): void {
    this.state.currentChord = [];
    this.state.waitingForChord = false;

    if (this.state.chordTimeout) {
      window.clearTimeout(this.state.chordTimeout);
      this.state.chordTimeout = null;
    }
  }

  /**
   * Executes a command or action for a matching keybinding
   */
  private async executeKeybinding(keybinding: ParsedKeybinding): Promise<void> {
    try {
      if (isParsedActionKeybinding(keybinding)) {
        // Execute action-based keybinding
        await executeAction(keybinding.action, this.context);
      } else if (isParsedCommandKeybinding(keybinding)) {
        // Execute legacy command-based keybinding
        await commandRegistry.execute(
          keybinding.command,
          keybinding.commandArgs,
        );
      } else {
        console.error("Unknown keybinding type:", keybinding);
      }
    } catch (error) {
      const identifier = isParsedActionKeybinding(keybinding)
        ? `action "${keybinding.action.id}"`
        : `command "${keybinding.command}"`;
      console.error(`Failed to execute ${identifier}:`, error);
    }
  }

  /**
   * Determines if we should ignore a keyboard event based on the target element
   */
  private shouldIgnoreEvent(target: HTMLElement): boolean {
    // Ignore events in input fields, textareas, and contenteditable elements
    const tagName = target.tagName.toLowerCase();

    if (tagName === "input" || tagName === "textarea") {
      return true;
    }

    if (target.contentEditable === "true") {
      return true;
    }

    // Ignore if any parent has contenteditable
    let parent = target.parentElement;
    while (parent) {
      if (parent.contentEditable === "true") {
        return true;
      }
      parent = parent.parentElement;
    }

    return false;
  }

  /**
   * Clears all registered keybindings
   */
  clear(): void {
    this.keybindings = [];
    this.resetChordState();
  }

  /**
   * Gets all registered keybindings
   */
  getKeybindings(): ParsedKeybinding[] {
    return [...this.keybindings];
  }
}

export const keybindingManager = new KeybindingManager();
