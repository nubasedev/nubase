import { describe, expect, it } from "vitest";
import {
  boldCommand,
  checkListCommand,
  codeBlockCommand,
  codeCommand,
  headingCommand,
  imageCommand,
  italicCommand,
  linkCommand,
  orderedListCommand,
  quoteCommand,
  strikethroughCommand,
  unorderedListCommand,
} from "./commands";
import type { TextController, TextState } from "./types";

// Mock text controller for testing
class MockTextController implements TextController {
  private state: TextState;

  constructor(initialState: TextState) {
    this.state = { ...initialState };
  }

  replaceSelection(text: string): TextState {
    const start = this.state.selection.start;
    const end = this.state.selection.end;
    this.state.text =
      this.state.text.slice(0, start) + text + this.state.text.slice(end);
    this.state.selection = {
      start: start + text.length,
      end: start + text.length,
    };
    return { ...this.state };
  }

  setSelectionRange(selection: { start: number; end: number }): TextState {
    this.state.selection = selection;
    return { ...this.state };
  }

  getState(): TextState {
    return { ...this.state };
  }
}

describe("boldCommand", () => {
  it("should wrap selected text with **", () => {
    const initialState: TextState = {
      text: "hello world",
      selection: { start: 0, end: 5 },
    };
    const textApi = new MockTextController(initialState);

    boldCommand.execute({ initialState, textApi });
    const result = textApi.getState();

    expect(result.text).toBe("**hello** world");
    expect(result.selection).toEqual({ start: 2, end: 7 });
  });

  it("should select word if no selection", () => {
    const initialState: TextState = {
      text: "hello world",
      selection: { start: 1, end: 1 },
    };
    const textApi = new MockTextController(initialState);

    boldCommand.execute({ initialState, textApi });
    const result = textApi.getState();

    expect(result.text).toBe("**hello** world");
    expect(result.selection).toEqual({ start: 2, end: 7 });
  });

  it("should undo bold formatting", () => {
    const initialState: TextState = {
      text: "**hello** world",
      selection: { start: 2, end: 7 },
    };
    const textApi = new MockTextController(initialState);

    expect(boldCommand.shouldUndo?.({ initialState })).toBe(true);
    boldCommand.undo?.({ initialState, textApi });
    const result = textApi.getState();

    expect(result.text).toBe("hello world");
    expect(result.selection).toEqual({ start: 0, end: 5 });
  });
});

describe("italicCommand", () => {
  it("should wrap selected text with _", () => {
    const initialState: TextState = {
      text: "hello world",
      selection: { start: 6, end: 11 },
    };
    const textApi = new MockTextController(initialState);

    italicCommand.execute({ initialState, textApi });
    const result = textApi.getState();

    expect(result.text).toBe("hello _world_");
    expect(result.selection).toEqual({ start: 7, end: 12 });
  });

  it("should undo italic formatting", () => {
    const initialState: TextState = {
      text: "hello _world_",
      selection: { start: 7, end: 12 },
    };
    const textApi = new MockTextController(initialState);

    expect(italicCommand.shouldUndo?.({ initialState })).toBe(true);
    italicCommand.undo?.({ initialState, textApi });
    const result = textApi.getState();

    expect(result.text).toBe("hello world");
    expect(result.selection).toEqual({ start: 6, end: 11 });
  });
});

describe("strikethroughCommand", () => {
  it("should wrap selected text with ~~", () => {
    const initialState: TextState = {
      text: "hello world",
      selection: { start: 0, end: 5 },
    };
    const textApi = new MockTextController(initialState);

    strikethroughCommand.execute({ initialState, textApi });
    const result = textApi.getState();

    expect(result.text).toBe("~~hello~~ world");
    expect(result.selection).toEqual({ start: 2, end: 7 });
  });
});

describe("codeCommand", () => {
  it("should wrap selected text with backticks", () => {
    const initialState: TextState = {
      text: "hello code world",
      selection: { start: 6, end: 10 },
    };
    const textApi = new MockTextController(initialState);

    codeCommand.execute({ initialState, textApi });
    const result = textApi.getState();

    expect(result.text).toBe("hello `code` world");
    expect(result.selection).toEqual({ start: 7, end: 11 });
  });
});

describe("headingCommand", () => {
  it("should add H1 prefix to line", () => {
    const initialState: TextState = {
      text: "My Title\nContent",
      selection: { start: 3, end: 3 },
    };
    const textApi = new MockTextController(initialState);

    headingCommand(1).execute({ initialState, textApi });
    const result = textApi.getState();

    expect(result.text).toBe("# My Title\nContent");
    expect(result.selection).toEqual({ start: 5, end: 5 });
  });

  it("should add H3 prefix to line", () => {
    const initialState: TextState = {
      text: "Title",
      selection: { start: 0, end: 0 },
    };
    const textApi = new MockTextController(initialState);

    headingCommand(3).execute({ initialState, textApi });
    const result = textApi.getState();

    expect(result.text).toBe("### Title");
    expect(result.selection).toEqual({ start: 4, end: 4 });
  });

  it("should toggle heading off", () => {
    const initialState: TextState = {
      text: "# Title\nContent",
      selection: { start: 3, end: 3 },
    };
    const textApi = new MockTextController(initialState);

    headingCommand(1).execute({ initialState, textApi });
    const result = textApi.getState();

    expect(result.text).toBe("Title\nContent");
    expect(result.selection).toEqual({ start: 1, end: 1 });
  });

  it("should replace different heading level", () => {
    const initialState: TextState = {
      text: "## Title\nContent",
      selection: { start: 5, end: 5 },
    };
    const textApi = new MockTextController(initialState);

    headingCommand(1).execute({ initialState, textApi });
    const result = textApi.getState();

    expect(result.text).toBe("# Title\nContent");
    expect(result.selection).toEqual({ start: 4, end: 4 });
  });

  it("should handle cursor at end of line", () => {
    const initialState: TextState = {
      text: "Title",
      selection: { start: 5, end: 5 },
    };
    const textApi = new MockTextController(initialState);

    headingCommand(2).execute({ initialState, textApi });
    const result = textApi.getState();

    expect(result.text).toBe("## Title");
    expect(result.selection).toEqual({ start: 8, end: 8 });
  });
});

describe("linkCommand", () => {
  it("should create link with selected text", () => {
    const initialState: TextState = {
      text: "Check out Google",
      selection: { start: 10, end: 16 },
    };
    const textApi = new MockTextController(initialState);

    linkCommand.execute({ initialState, textApi });
    const result = textApi.getState();

    expect(result.text).toBe("Check out [Google](url)");
    expect(result.selection).toEqual({ start: 19, end: 22 });
  });

  it("should create link with default text when no selection", () => {
    const initialState: TextState = {
      text: "Click here: ",
      selection: { start: 12, end: 12 },
    };
    const textApi = new MockTextController(initialState);

    linkCommand.execute({ initialState, textApi });
    const result = textApi.getState();

    expect(result.text).toBe("Click here: [link text](url)");
    expect(result.selection).toEqual({ start: 24, end: 27 });
  });
});

describe("imageCommand", () => {
  it("should create image with selected alt text", () => {
    const initialState: TextState = {
      text: "Logo",
      selection: { start: 0, end: 4 },
    };
    const textApi = new MockTextController(initialState);

    imageCommand.execute({ initialState, textApi });
    const result = textApi.getState();

    expect(result.text).toBe("![Logo](url)");
    expect(result.selection).toEqual({ start: 8, end: 11 });
  });
});

describe("quoteCommand", () => {
  it("should add quote prefix to single line", () => {
    const initialState: TextState = {
      text: "This is a quote",
      selection: { start: 0, end: 15 },
    };
    const textApi = new MockTextController(initialState);

    quoteCommand.execute({ initialState, textApi });
    const result = textApi.getState();

    expect(result.text).toBe("> This is a quote");
    expect(result.selection).toEqual({ start: 2, end: 17 });
  });

  it("should add quote prefix to multiple lines", () => {
    const initialState: TextState = {
      text: "Line 1\nLine 2\nLine 3",
      selection: { start: 0, end: 20 },
    };
    const textApi = new MockTextController(initialState);

    quoteCommand.execute({ initialState, textApi });
    const result = textApi.getState();

    expect(result.text).toBe("> Line 1\n> Line 2\n> Line 3");
    expect(result.selection).toEqual({ start: 2, end: 26 });
  });
});

describe("codeBlockCommand", () => {
  it("should wrap selection in code block", () => {
    const initialState: TextState = {
      text: "const x = 5;",
      selection: { start: 0, end: 12 },
    };
    const textApi = new MockTextController(initialState);

    codeBlockCommand.execute({ initialState, textApi });
    const result = textApi.getState();

    expect(result.text).toBe("```\nconst x = 5;\n```");
    expect(result.selection).toEqual({ start: 4, end: 16 });
  });

  it("should add empty lines when needed", () => {
    const initialState: TextState = {
      text: "Before\ncode\nAfter",
      selection: { start: 7, end: 11 },
    };
    const textApi = new MockTextController(initialState);

    codeBlockCommand.execute({ initialState, textApi });
    const result = textApi.getState();

    expect(result.text).toBe("Before\n\n```\ncode\n```\n\nAfter");
    expect(result.selection).toEqual({ start: 12, end: 16 });
  });
});

describe("unorderedListCommand", () => {
  it("should create bullet list from selection", () => {
    const initialState: TextState = {
      text: "Item 1\nItem 2\nItem 3",
      selection: { start: 0, end: 20 },
    };
    const textApi = new MockTextController(initialState);

    unorderedListCommand.execute({ initialState, textApi });
    const result = textApi.getState();

    expect(result.text).toBe("- Item 1\n- Item 2\n- Item 3");
    expect(result.selection).toEqual({ start: 2, end: 26 });
  });

  it("should handle single line", () => {
    const initialState: TextState = {
      text: "Single item",
      selection: { start: 0, end: 11 },
    };
    const textApi = new MockTextController(initialState);

    unorderedListCommand.execute({ initialState, textApi });
    const result = textApi.getState();

    expect(result.text).toBe("- Single item");
    expect(result.selection).toEqual({ start: 2, end: 13 });
  });
});

describe("orderedListCommand", () => {
  it("should create numbered list from selection", () => {
    const initialState: TextState = {
      text: "First\nSecond\nThird",
      selection: { start: 0, end: 18 },
    };
    const textApi = new MockTextController(initialState);

    orderedListCommand.execute({ initialState, textApi });
    const result = textApi.getState();

    expect(result.text).toBe("1. First\n2. Second\n3. Third");
    expect(result.selection).toEqual({ start: 3, end: 27 });
  });
});

describe("checkListCommand", () => {
  it("should create checklist from selection", () => {
    const initialState: TextState = {
      text: "Task 1\nTask 2",
      selection: { start: 0, end: 13 },
    };
    const textApi = new MockTextController(initialState);

    checkListCommand.execute({ initialState, textApi });
    const result = textApi.getState();

    expect(result.text).toBe("- [ ] Task 1\n- [ ] Task 2");
    expect(result.selection).toEqual({ start: 6, end: 25 });
  });
});
