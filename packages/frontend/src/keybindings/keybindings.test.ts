import { beforeEach, describe, expect, it } from "vitest";
import type { Keybinding } from "../commands/types";
import { keybindingManager } from "./KeybindingManager";
import {
  matchesKeySequence,
  normalizeEventKey,
  parseKeybinding,
} from "./keyParser";

// Mock KeyboardEvent for testing environment
class MockKeyboardEvent {
  public readonly key: string;
  public readonly metaKey: boolean;
  public readonly ctrlKey: boolean;
  public readonly altKey: boolean;
  public readonly shiftKey: boolean;

  constructor(
    _type: string,
    options: {
      key?: string;
      metaKey?: boolean;
      ctrlKey?: boolean;
      altKey?: boolean;
      shiftKey?: boolean;
    },
  ) {
    this.key = options.key || "";
    this.metaKey = options.metaKey || false;
    this.ctrlKey = options.ctrlKey || false;
    this.altKey = options.altKey || false;
    this.shiftKey = options.shiftKey || false;
  }
}

// Override global KeyboardEvent for tests
global.KeyboardEvent = MockKeyboardEvent as any;

describe("Keybinding System", () => {
  beforeEach(() => {
    keybindingManager.clear();
  });

  describe("parseKeybinding", () => {
    it("should parse simple keybinding", () => {
      const keybinding: Keybinding = {
        key: "meta+k",
        command: "test.command",
      };

      const parsed = parseKeybinding(keybinding);
      expect(parsed).toHaveLength(1);
      expect(parsed[0]?.sequences).toEqual(["meta+k"]);
      expect(parsed[0]?.command).toBe("test.command");
    });

    it("should parse chord keybinding", () => {
      const keybinding: Keybinding = {
        key: "ctrl+k ctrl+c",
        command: "test.chord",
      };

      const parsed = parseKeybinding(keybinding);
      expect(parsed).toHaveLength(1);
      expect(parsed[0]?.sequences).toEqual(["ctrl+k", "ctrl+c"]);
    });

    it("should parse array of alternative keybindings", () => {
      const keybinding: Keybinding = {
        key: ["meta+k", "ctrl+k"],
        command: "test.alternatives",
      };

      const parsed = parseKeybinding(keybinding);
      expect(parsed).toHaveLength(2);
      expect(parsed[0]?.sequences).toEqual(["meta+k"]);
      expect(parsed[1]?.sequences).toEqual(["ctrl+k"]);
      expect(parsed[0]?.command).toBe("test.alternatives");
      expect(parsed[1]?.command).toBe("test.alternatives");
    });

    it("should parse array with chord keybindings", () => {
      const keybinding: Keybinding = {
        key: ["ctrl+k ctrl+c", "meta+k meta+c"],
        command: "test.chord.alternatives",
      };

      const parsed = parseKeybinding(keybinding);
      expect(parsed).toHaveLength(2);
      expect(parsed[0]?.sequences).toEqual(["ctrl+k", "ctrl+c"]);
      expect(parsed[1]?.sequences).toEqual(["meta+k", "meta+c"]);
    });
  });

  describe("normalizeEventKey", () => {
    it("should normalize basic key events", () => {
      const event = new KeyboardEvent("keydown", {
        key: "k",
        metaKey: true,
      });

      const normalized = normalizeEventKey(event);
      expect(normalized).toBe("meta+k");
    });

    it("should normalize key events with multiple modifiers", () => {
      const event = new KeyboardEvent("keydown", {
        key: "p",
        ctrlKey: true,
        shiftKey: true,
      });

      const normalized = normalizeEventKey(event);
      expect(normalized).toBe("ctrl+shift+p");
    });

    it("should normalize special keys", () => {
      const event = new KeyboardEvent("keydown", {
        key: " ",
        ctrlKey: true,
      });

      const normalized = normalizeEventKey(event);
      expect(normalized).toBe("ctrl+space");
    });
  });

  describe("matchesKeySequence", () => {
    it("should match identical sequences", () => {
      expect(matchesKeySequence("meta+k", "meta+k")).toBe(true);
    });

    it("should match case-insensitive", () => {
      expect(matchesKeySequence("meta+k", "META+K")).toBe(true);
    });

    it("should not match different sequences", () => {
      expect(matchesKeySequence("meta+k", "ctrl+k")).toBe(false);
    });
  });

  describe("KeybindingManager", () => {
    it("should register keybindings", () => {
      const keybindings: Keybinding[] = [
        { key: "meta+k", command: "test.command1" },
        { key: "ctrl+p", command: "test.command2" },
      ];

      keybindingManager.registerKeybindings(keybindings);
      const registered = keybindingManager.getKeybindings();

      expect(registered).toHaveLength(2);
      expect(registered[0]?.command).toBe("test.command1");
      expect(registered[1]?.command).toBe("test.command2");
    });

    it("should register array keybindings as multiple parsed keybindings", () => {
      const keybindings: Keybinding[] = [
        { key: ["meta+k", "ctrl+k"], command: "test.alternatives" },
      ];

      keybindingManager.registerKeybindings(keybindings);
      const registered = keybindingManager.getKeybindings();

      expect(registered).toHaveLength(2);
      expect(registered[0]?.command).toBe("test.alternatives");
      expect(registered[1]?.command).toBe("test.alternatives");
      expect(registered[0]?.sequences).toEqual(["meta+k"]);
      expect(registered[1]?.sequences).toEqual(["ctrl+k"]);
    });

    it("should clear existing keybindings when registering new ones", () => {
      const keybindings1: Keybinding[] = [
        { key: "meta+k", command: "test.command1" },
      ];
      const keybindings2: Keybinding[] = [
        { key: "ctrl+p", command: "test.command2" },
      ];

      keybindingManager.registerKeybindings(keybindings1);
      expect(keybindingManager.getKeybindings()).toHaveLength(1);

      keybindingManager.registerKeybindings(keybindings2);
      expect(keybindingManager.getKeybindings()).toHaveLength(1);
      expect(keybindingManager.getKeybindings()[0]?.command).toBe(
        "test.command2",
      );
    });

    it("should clear all keybindings", () => {
      const keybindings: Keybinding[] = [
        { key: "meta+k", command: "test.command1" },
      ];

      keybindingManager.registerKeybindings(keybindings);
      expect(keybindingManager.getKeybindings()).toHaveLength(1);

      keybindingManager.clear();
      expect(keybindingManager.getKeybindings()).toHaveLength(0);
    });
  });
});
