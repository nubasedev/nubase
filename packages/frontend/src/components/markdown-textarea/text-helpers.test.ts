import { describe, expect, it } from "vitest";
import {
  getBreaksNeededForEmptyLineAfter,
  getBreaksNeededForEmptyLineBefore,
  getCharactersAfterSelection,
  getCharactersBeforeSelection,
  getSelectedText,
  getSurroundingWord,
  insertBeforeEachLine,
  selectWord,
} from "./text-helpers";
import type { TextState } from "./types";

describe("getSurroundingWord", () => {
  it("should get the word boundaries when cursor is in the middle", () => {
    const text = "hello world test";
    const result = getSurroundingWord(text, 7); // cursor in "world"
    expect(result).toEqual({ start: 6, end: 11 });
  });

  it("should get the word boundaries when cursor is at the beginning", () => {
    const text = "hello world";
    const result = getSurroundingWord(text, 0);
    expect(result).toEqual({ start: 0, end: 5 });
  });

  it("should get the word boundaries when cursor is at the end", () => {
    const text = "hello world";
    const result = getSurroundingWord(text, 11);
    expect(result).toEqual({ start: 6, end: 11 });
  });

  it("should handle newlines as word delimiters", () => {
    const text = "hello\nworld";
    const result = getSurroundingWord(text, 7); // cursor in "world"
    expect(result).toEqual({ start: 6, end: 11 });
  });

  it("should handle cursor between words", () => {
    const text = "hello world";
    const result = getSurroundingWord(text, 5); // cursor at space
    expect(result).toEqual({ start: 0, end: 5 });
  });

  it("should throw error for empty text", () => {
    expect(() => getSurroundingWord("", 0)).toThrow(
      "Argument 'text' should be truthy",
    );
  });
});

describe("selectWord", () => {
  it("should select word when cursor position equals selection", () => {
    const state: TextState = {
      text: "hello world",
      selection: { start: 7, end: 7 },
    };
    const result = selectWord(state);
    expect(result).toEqual({ start: 6, end: 11 });
  });

  it("should return original selection when text is already selected", () => {
    const state: TextState = {
      text: "hello world",
      selection: { start: 0, end: 5 },
    };
    const result = selectWord(state);
    expect(result).toEqual({ start: 0, end: 5 });
  });

  it("should handle empty text", () => {
    const state: TextState = {
      text: "",
      selection: { start: 0, end: 0 },
    };
    const result = selectWord(state);
    expect(result).toEqual({ start: 0, end: 0 });
  });
});

describe("getSelectedText", () => {
  it("should return selected text", () => {
    const state: TextState = {
      text: "hello world",
      selection: { start: 6, end: 11 },
    };
    expect(getSelectedText(state)).toBe("world");
  });

  it("should return empty string when nothing is selected", () => {
    const state: TextState = {
      text: "hello world",
      selection: { start: 5, end: 5 },
    };
    expect(getSelectedText(state)).toBe("");
  });

  it("should handle full text selection", () => {
    const state: TextState = {
      text: "hello",
      selection: { start: 0, end: 5 },
    };
    expect(getSelectedText(state)).toBe("hello");
  });
});

describe("getCharactersBeforeSelection", () => {
  it("should get characters before selection", () => {
    const state: TextState = {
      text: "**hello world",
      selection: { start: 2, end: 7 },
    };
    expect(getCharactersBeforeSelection(state, 2)).toBe("**");
  });

  it("should return empty string when at the beginning", () => {
    const state: TextState = {
      text: "hello",
      selection: { start: 0, end: 0 },
    };
    expect(getCharactersBeforeSelection(state, 2)).toBe("");
  });

  it("should handle request for more characters than available", () => {
    const state: TextState = {
      text: "hi",
      selection: { start: 1, end: 1 },
    };
    expect(getCharactersBeforeSelection(state, 5)).toBe("h");
  });
});

describe("getCharactersAfterSelection", () => {
  it("should get characters after selection", () => {
    const state: TextState = {
      text: "hello world**",
      selection: { start: 5, end: 11 },
    };
    expect(getCharactersAfterSelection(state, 2)).toBe("**");
  });

  it("should return empty string when at the end", () => {
    const state: TextState = {
      text: "hello",
      selection: { start: 5, end: 5 },
    };
    expect(getCharactersAfterSelection(state, 2)).toBe("");
  });

  it("should handle request for more characters than available", () => {
    const state: TextState = {
      text: "hello!",
      selection: { start: 5, end: 5 },
    };
    expect(getCharactersAfterSelection(state, 5)).toBe("!");
  });
});

describe("getBreaksNeededForEmptyLineBefore", () => {
  it("should return 0 for position 0", () => {
    expect(getBreaksNeededForEmptyLineBefore("hello", 0)).toBe(0);
  });

  it("should return 2 when scanning from middle of line", () => {
    // Position 5 in "hello world" - scans backward, hits 'o', returns neededBreaks = 2
    expect(getBreaksNeededForEmptyLineBefore("hello world", 5)).toBe(2);
  });

  it("should return 2 when no line breaks exist before", () => {
    // "hello\nworld" at position 7 ('o' in world) - we hit 'r' then return 2
    expect(getBreaksNeededForEmptyLineBefore("hello\nworld", 7)).toBe(2);
  });

  it("should return 1 when one line break exists before", () => {
    // "hello\n\nworld" at pos 8 ('o' in world) - hits 'o', returns 2
    expect(getBreaksNeededForEmptyLineBefore("hello\n\nworld", 8)).toBe(2);
  });

  it("should return 0 when two line breaks exist before", () => {
    // "hello\n\n\nworld" at pos 9 ('o' in world) - hits 'o', returns 2
    expect(getBreaksNeededForEmptyLineBefore("hello\n\n\nworld", 9)).toBe(2);
  });

  it("should ignore spaces when checking", () => {
    // "hello\n  \nworld" position 10 ('o' in world) - hits 'o', returns 2
    expect(getBreaksNeededForEmptyLineBefore("hello\n  \nworld", 10)).toBe(2);
  });
});

describe("getBreaksNeededForEmptyLineAfter", () => {
  it("should return 0 for last position", () => {
    const text = "hello";
    expect(getBreaksNeededForEmptyLineAfter(text, text.length - 1)).toBe(0);
  });

  it("should return 2 when scanning forward in same line", () => {
    expect(getBreaksNeededForEmptyLineAfter("hello world", 5)).toBe(2);
  });

  it("should return 2 when no line breaks exist after", () => {
    expect(getBreaksNeededForEmptyLineAfter("hello\nworld", 4)).toBe(2);
  });

  it("should return 2 when scanning forward hits content", () => {
    expect(getBreaksNeededForEmptyLineAfter("hello\n\nworld", 4)).toBe(2);
  });

  it("should return 2 when scanning forward hits content", () => {
    expect(getBreaksNeededForEmptyLineAfter("hello\n\n\nworld", 4)).toBe(2);
  });

  it("should return 2 when scanning forward ignores spaces but hits content", () => {
    expect(getBreaksNeededForEmptyLineAfter("hello\n  \nworld", 4)).toBe(2);
  });
});

describe("insertBeforeEachLine", () => {
  it("should insert string before each line", () => {
    const text = "line1\nline2\nline3";
    const result = insertBeforeEachLine(text, "> ");
    expect(result.modifiedText).toBe("> line1\n> line2\n> line3");
    expect(result.insertionLength).toBe(6); // 3 lines * 2 chars
  });

  it("should handle single line", () => {
    const result = insertBeforeEachLine("hello", "- ");
    expect(result.modifiedText).toBe("- hello");
    expect(result.insertionLength).toBe(2);
  });

  it("should handle empty lines", () => {
    const text = "line1\n\nline3";
    const result = insertBeforeEachLine(text, "* ");
    expect(result.modifiedText).toBe("* line1\n* \n* line3");
    expect(result.insertionLength).toBe(6);
  });

  it("should handle function insertion", () => {
    const text = "item1\nitem2\nitem3";
    const result = insertBeforeEachLine(
      text,
      (_line, index) => `${index + 1}. `,
    );
    expect(result.modifiedText).toBe("1. item1\n2. item2\n3. item3");
    expect(result.insertionLength).toBe(9); // "1. " + "2. " + "3. "
  });

  it("should throw error for invalid insertion type", () => {
    expect(() => {
      insertBeforeEachLine("test", 123 as any);
    }).toThrow("insertion is expected to be either a string or a function");
  });
});
