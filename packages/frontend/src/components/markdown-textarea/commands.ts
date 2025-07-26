import {
  getBreaksNeededForEmptyLineAfter,
  getBreaksNeededForEmptyLineBefore,
  getCharactersAfterSelection,
  getCharactersBeforeSelection,
  getSelectedText,
  insertBeforeEachLine,
  selectWord,
} from "./text-helpers";
import type { MarkdownCommand } from "./types";

export const boldCommand: MarkdownCommand = {
  shouldUndo: (options) => {
    return (
      getCharactersBeforeSelection(options.initialState, 2) === "**" &&
      getCharactersAfterSelection(options.initialState, 2) === "**"
    );
  },
  execute: ({ initialState, textApi }) => {
    const newSelectionRange = selectWord({
      text: initialState.text,
      selection: initialState.selection,
    });
    const state1 = textApi.setSelectionRange(newSelectionRange);
    const state2 = textApi.replaceSelection(`**${getSelectedText(state1)}**`);
    textApi.setSelectionRange({
      start: state2.selection.end - 2 - getSelectedText(state1).length,
      end: state2.selection.end - 2,
    });
  },
  undo: ({ initialState, textApi }) => {
    const text = getSelectedText(initialState);
    textApi.setSelectionRange({
      start: initialState.selection.start - 2,
      end: initialState.selection.end + 2,
    });
    textApi.replaceSelection(text);
    textApi.setSelectionRange({
      start: initialState.selection.start - 2,
      end: initialState.selection.end - 2,
    });
  },
};

export const italicCommand: MarkdownCommand = {
  shouldUndo: (options) => {
    return (
      getCharactersBeforeSelection(options.initialState, 1) === "_" &&
      getCharactersAfterSelection(options.initialState, 1) === "_"
    );
  },
  execute: ({ initialState, textApi }) => {
    const newSelectionRange = selectWord({
      text: initialState.text,
      selection: initialState.selection,
    });
    const state1 = textApi.setSelectionRange(newSelectionRange);
    const state2 = textApi.replaceSelection(`_${getSelectedText(state1)}_`);
    textApi.setSelectionRange({
      start: state2.selection.end - 1 - getSelectedText(state1).length,
      end: state2.selection.end - 1,
    });
  },
  undo: ({ initialState, textApi }) => {
    const text = getSelectedText(initialState);
    textApi.setSelectionRange({
      start: initialState.selection.start - 1,
      end: initialState.selection.end + 1,
    });
    textApi.replaceSelection(text);
    textApi.setSelectionRange({
      start: initialState.selection.start - 1,
      end: initialState.selection.end - 1,
    });
  },
};

export const strikethroughCommand: MarkdownCommand = {
  shouldUndo: (options) => {
    return (
      getCharactersBeforeSelection(options.initialState, 2) === "~~" &&
      getCharactersAfterSelection(options.initialState, 2) === "~~"
    );
  },
  execute: ({ initialState, textApi }) => {
    const newSelectionRange = selectWord({
      text: initialState.text,
      selection: initialState.selection,
    });
    const state1 = textApi.setSelectionRange(newSelectionRange);
    const state2 = textApi.replaceSelection(`~~${getSelectedText(state1)}~~`);
    textApi.setSelectionRange({
      start: state2.selection.end - 2 - getSelectedText(state1).length,
      end: state2.selection.end - 2,
    });
  },
  undo: ({ initialState, textApi }) => {
    const text = getSelectedText(initialState);
    textApi.setSelectionRange({
      start: initialState.selection.start - 2,
      end: initialState.selection.end + 2,
    });
    textApi.replaceSelection(text);
    textApi.setSelectionRange({
      start: initialState.selection.start - 2,
      end: initialState.selection.end - 2,
    });
  },
};

export const codeCommand: MarkdownCommand = {
  shouldUndo: (options) => {
    return (
      getCharactersBeforeSelection(options.initialState, 1) === "`" &&
      getCharactersAfterSelection(options.initialState, 1) === "`"
    );
  },
  execute: ({ initialState, textApi }) => {
    const newSelectionRange = selectWord({
      text: initialState.text,
      selection: initialState.selection,
    });
    const state1 = textApi.setSelectionRange(newSelectionRange);
    const state2 = textApi.replaceSelection(`\`${getSelectedText(state1)}\``);
    textApi.setSelectionRange({
      start: state2.selection.end - 1 - getSelectedText(state1).length,
      end: state2.selection.end - 1,
    });
  },
  undo: ({ initialState, textApi }) => {
    const text = getSelectedText(initialState);
    textApi.setSelectionRange({
      start: initialState.selection.start - 1,
      end: initialState.selection.end + 1,
    });
    textApi.replaceSelection(text);
    textApi.setSelectionRange({
      start: initialState.selection.start - 1,
      end: initialState.selection.end - 1,
    });
  },
};

export const headingCommand = (level: number): MarkdownCommand => ({
  execute: ({ initialState, textApi }) => {
    const prefix = `${"#".repeat(level)} `;
    const _selectedText = getSelectedText(initialState);
    const textBeforeSelection = initialState.text.slice(
      0,
      initialState.selection.start,
    );
    const lineStart = Math.max(0, textBeforeSelection.lastIndexOf("\n") + 1);
    const lineEnd = initialState.text.indexOf("\n", initialState.selection.end);
    const line = initialState.text.slice(
      lineStart,
      lineEnd === -1 ? undefined : lineEnd,
    );

    const currentPrefix = line.match(/^#+\s/)?.[0] || "";

    if (currentPrefix === prefix) {
      textApi.setSelectionRange({
        start: lineStart,
        end: lineStart + currentPrefix.length,
      });
      textApi.replaceSelection("");
      textApi.setSelectionRange({
        start: initialState.selection.start - currentPrefix.length,
        end: initialState.selection.end - currentPrefix.length,
      });
    } else if (currentPrefix) {
      textApi.setSelectionRange({
        start: lineStart,
        end: lineStart + currentPrefix.length,
      });
      textApi.replaceSelection(prefix);
      const lengthDiff = prefix.length - currentPrefix.length;
      textApi.setSelectionRange({
        start: initialState.selection.start + lengthDiff,
        end: initialState.selection.end + lengthDiff,
      });
    } else {
      textApi.setSelectionRange({ start: lineStart, end: lineStart });
      textApi.replaceSelection(prefix);
      textApi.setSelectionRange({
        start: initialState.selection.start + prefix.length,
        end: initialState.selection.end + prefix.length,
      });
    }
  },
});

export const linkCommand: MarkdownCommand = {
  execute: ({ initialState, textApi }) => {
    const selectedText = getSelectedText(initialState);
    const text = selectedText || "link text";
    const state = textApi.replaceSelection(`[${text}](url)`);
    textApi.setSelectionRange({
      start: state.selection.start - 4,
      end: state.selection.start - 1,
    });
  },
};

export const imageCommand: MarkdownCommand = {
  execute: ({ initialState, textApi }) => {
    const selectedText = getSelectedText(initialState);
    const altText = selectedText || "alt text";
    const state = textApi.replaceSelection(`![${altText}](url)`);
    textApi.setSelectionRange({
      start: state.selection.start - 4,
      end: state.selection.start - 1,
    });
  },
};

export const quoteCommand: MarkdownCommand = {
  execute: ({ initialState, textApi }) => {
    const { modifiedText } = insertBeforeEachLine(
      getSelectedText(initialState),
      "> ",
    );

    const state = textApi.replaceSelection(modifiedText);
    textApi.setSelectionRange({
      start: initialState.selection.start + 2,
      end: state.selection.end,
    });
  },
};

export const codeBlockCommand: MarkdownCommand = {
  execute: ({ initialState, textApi }) => {
    const selectedText = getSelectedText(initialState);
    const breaksBeforeCount = getBreaksNeededForEmptyLineBefore(
      initialState.text,
      initialState.selection.start,
    );
    const breaksBefore = Array(breaksBeforeCount + 1).join("\n");

    const breaksAfterCount = getBreaksNeededForEmptyLineAfter(
      initialState.text,
      initialState.selection.end,
    );
    const breaksAfter = Array(breaksAfterCount + 1).join("\n");

    const _state = textApi.replaceSelection(
      `${breaksBefore}\`\`\`\n${selectedText}\n\`\`\`${breaksAfter}`,
    );

    textApi.setSelectionRange({
      start: initialState.selection.start + breaksBeforeCount + 4,
      end:
        initialState.selection.start +
        breaksBeforeCount +
        4 +
        selectedText.length,
    });
  },
};

export const unorderedListCommand: MarkdownCommand = {
  execute: ({ initialState, textApi }) => {
    const { modifiedText } = insertBeforeEachLine(
      getSelectedText(initialState),
      "- ",
    );

    const state = textApi.replaceSelection(modifiedText);
    textApi.setSelectionRange({
      start: initialState.selection.start + 2,
      end: state.selection.end,
    });
  },
};

export const orderedListCommand: MarkdownCommand = {
  execute: ({ initialState, textApi }) => {
    const { modifiedText } = insertBeforeEachLine(
      getSelectedText(initialState),
      (_line, index) => `${index + 1}. `,
    );

    const state = textApi.replaceSelection(modifiedText);
    textApi.setSelectionRange({
      start: initialState.selection.start + 3,
      end: state.selection.end,
    });
  },
};

export const checkListCommand: MarkdownCommand = {
  execute: ({ initialState, textApi }) => {
    const { modifiedText } = insertBeforeEachLine(
      getSelectedText(initialState),
      "- [ ] ",
    );

    const state = textApi.replaceSelection(modifiedText);
    textApi.setSelectionRange({
      start: initialState.selection.start + 6,
      end: state.selection.end,
    });
  },
};
