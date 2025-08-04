import { beforeAll, describe, expect, it, vi } from "vitest";
import { getStateFromTextArea, insertText } from "./text-controller";

// Set up DOM environment
beforeAll(() => {
  // Mock document if it doesn't exist
  if (!global.document) {
    global.document = {} as Document;
  }

  // Mock document methods and properties
  Object.defineProperty(global.document, "execCommand", {
    value: vi.fn(() => false),
    writable: true,
    configurable: true,
  });

  Object.defineProperty(global.document, "createEvent", {
    value: vi.fn(() => ({
      initEvent: vi.fn(),
    })),
    writable: true,
    configurable: true,
  });

  Object.defineProperty(global.document, "createElement", {
    value: vi.fn((tag: string) => {
      if (tag === "textarea") {
        return {
          value: "",
          firstChild: null,
        };
      }
      return {};
    }),
    writable: true,
    configurable: true,
  });
});

// Mock HTMLTextAreaElement
class MockTextArea {
  public value = "";
  public selectionStart = 0;
  public selectionEnd = 0;
  public nodeName = "TEXTAREA";

  focus = vi.fn();
  setSelectionRange = vi.fn((start: number, end: number) => {
    this.selectionStart = start;
    this.selectionEnd = end;
  });
  dispatchEvent = vi.fn();
  setRangeText = vi.fn((text: string) => {
    const start = this.selectionStart;
    const end = this.selectionEnd;
    this.value = this.value.slice(0, start) + text + this.value.slice(end);
    this.selectionStart = start + text.length;
    this.selectionEnd = start + text.length;
  });
}

describe("getStateFromTextArea", () => {
  it("should return current text and selection state", () => {
    const textArea = new MockTextArea();
    textArea.value = "hello world";
    textArea.selectionStart = 6;
    textArea.selectionEnd = 11;

    const result = getStateFromTextArea(textArea as any);

    expect(result).toEqual({
      text: "hello world",
      selection: { start: 6, end: 11 },
    });
  });

  it("should handle empty textarea", () => {
    const textArea = new MockTextArea();

    const result = getStateFromTextArea(textArea as any);

    expect(result).toEqual({
      text: "",
      selection: { start: 0, end: 0 },
    });
  });

  it("should handle cursor position (same start/end)", () => {
    const textArea = new MockTextArea();
    textArea.value = "test";
    textArea.selectionStart = 2;
    textArea.selectionEnd = 2;

    const result = getStateFromTextArea(textArea as any);

    expect(result).toEqual({
      text: "test",
      selection: { start: 2, end: 2 },
    });
  });
});

describe("insertText", () => {
  it("should focus the input element", () => {
    const textArea = new MockTextArea();

    insertText(textArea as any, "test");

    expect(textArea.focus).toHaveBeenCalled();
  });

  it("should use setRangeText when available", () => {
    const textArea = new MockTextArea();
    textArea.value = "hello world";
    textArea.selectionStart = 6;
    textArea.selectionEnd = 11;

    insertText(textArea as any, "universe");

    expect(textArea.setRangeText).toHaveBeenCalledWith("universe");
  });

  it("should fallback to manual text replacement", () => {
    const textArea = new MockTextArea();
    // Remove setRangeText to trigger fallback
    delete (textArea as any).setRangeText;
    textArea.value = "hello world";
    textArea.selectionStart = 6;
    textArea.selectionEnd = 11;

    insertText(textArea as any, "universe");

    expect(textArea.value).toBe("hello universe");
    expect(textArea.setSelectionRange).toHaveBeenCalledWith(14, 14);
  });

  it("should handle insertion at cursor position", () => {
    const textArea = new MockTextArea();
    delete (textArea as any).setRangeText;
    textArea.value = "hello world";
    textArea.selectionStart = 5;
    textArea.selectionEnd = 5;

    insertText(textArea as any, " amazing");

    expect(textArea.value).toBe("hello amazing world");
    expect(textArea.setSelectionRange).toHaveBeenCalledWith(13, 13);
  });

  it("should handle replacement of selected text", () => {
    const textArea = new MockTextArea();
    delete (textArea as any).setRangeText;
    textArea.value = "hello old world";
    textArea.selectionStart = 6;
    textArea.selectionEnd = 9; // "old"

    insertText(textArea as any, "new");

    expect(textArea.value).toBe("hello new world");
    expect(textArea.setSelectionRange).toHaveBeenCalledWith(9, 9);
  });

  it("should dispatch input event", () => {
    const textArea = new MockTextArea();
    delete (textArea as any).setRangeText;

    insertText(textArea as any, "test");

    expect(textArea.dispatchEvent).toHaveBeenCalled();
  });

  it("should handle input elements", () => {
    const input = {
      nodeName: "INPUT",
      value: "test",
      selectionStart: 4,
      selectionEnd: 4,
      focus: vi.fn(),
      setSelectionRange: vi.fn(),
      dispatchEvent: vi.fn(),
    };

    insertText(input as any, " more");

    expect(input.value).toBe("test more");
    expect(input.setSelectionRange).toHaveBeenCalledWith(9, 9);
  });

  it("should handle IE legacy selection", () => {
    // Mock IE document.selection
    const mockSelection = {
      createRange: vi.fn(() => ({
        text: "",
        collapse: vi.fn(),
        select: vi.fn(),
      })),
    };

    (document as any).selection = mockSelection;

    const textArea = new MockTextArea();

    insertText(textArea as any, "test");

    expect(mockSelection.createRange).toHaveBeenCalled();

    // Clean up
    delete (document as any).selection;
  });

  it("should handle successful execCommand", () => {
    // Mock successful execCommand
    vi.mocked(document.execCommand).mockReturnValueOnce(true);

    const textArea = new MockTextArea();
    const focusSpy = vi.spyOn(textArea, "focus");

    insertText(textArea as any, "test");

    expect(focusSpy).toHaveBeenCalled();
    expect(document.execCommand).toHaveBeenCalledWith(
      "insertText",
      false,
      "test",
    );
  });

  it("should handle empty text insertion", () => {
    const textArea = new MockTextArea();
    delete (textArea as any).setRangeText;
    textArea.value = "hello world";
    textArea.selectionStart = 5;
    textArea.selectionEnd = 5;

    insertText(textArea as any, "");

    expect(textArea.value).toBe("hello world");
    expect(textArea.setSelectionRange).toHaveBeenCalledWith(5, 5);
  });
});
