import type { SelectionRange, TextState } from "./types";

export function getSurroundingWord(
  text: string,
  position: number,
): SelectionRange {
  if (!text) throw Error("Argument 'text' should be truthy");

  const isWordDelimiter = (c: string | undefined) =>
    c === " " || c?.charCodeAt(0) === 10;

  let start = 0;
  let end = text.length;

  for (let i = position; i - 1 > -1; i--) {
    if (isWordDelimiter(text[i - 1])) {
      start = i;
      break;
    }
  }

  for (let i = position; i < text.length; i++) {
    if (isWordDelimiter(text[i])) {
      end = i;
      break;
    }
  }

  return { start, end };
}

export function selectWord({ text, selection }: TextState): SelectionRange {
  if (text?.length && selection.start === selection.end) {
    return getSurroundingWord(text, selection.start);
  }
  return selection;
}

export function getSelectedText(textState: TextState): string {
  return textState.text.slice(
    textState.selection.start,
    textState.selection.end,
  );
}

export function getCharactersBeforeSelection(
  textState: TextState,
  characters: number,
): string {
  return textState.text.slice(
    textState.selection.start - characters,
    textState.selection.start,
  );
}

export function getCharactersAfterSelection(
  textState: TextState,
  characters: number,
): string {
  return textState.text.slice(
    textState.selection.end,
    textState.selection.end + characters,
  );
}

export function getBreaksNeededForEmptyLineBefore(
  text = "",
  startPosition: number,
): number {
  if (startPosition === 0) return 0;

  let neededBreaks = 2;
  let isInFirstLine = true;
  for (let i = startPosition - 1; i >= 0 && neededBreaks >= 0; i--) {
    switch (text.charCodeAt(i)) {
      case 32:
        continue;
      case 10:
        neededBreaks--;
        isInFirstLine = false;
        break;
      default:
        return neededBreaks;
    }
  }
  return isInFirstLine ? 0 : neededBreaks;
}

export function getBreaksNeededForEmptyLineAfter(
  text = "",
  startPosition: number,
) {
  if (startPosition === text.length - 1) return 0;

  let neededBreaks = 2;
  let isInLastLine = true;
  for (let i = startPosition; i < text.length && neededBreaks >= 0; i++) {
    switch (text.charCodeAt(i)) {
      case 32:
        continue;
      case 10: {
        neededBreaks--;
        isInLastLine = false;
        break;
      }
      default:
        return neededBreaks;
    }
  }
  return isInLastLine ? 0 : neededBreaks;
}

type AlterLineFunction = (line: string, index: number) => string;

export function insertBeforeEachLine(
  selectedText: string,
  insertBefore: string | AlterLineFunction,
): { modifiedText: string; insertionLength: number } {
  const lines = selectedText.split(/\n/);

  let insertionLength = 0;
  const modifiedText = lines
    .map((item, index) => {
      if (typeof insertBefore === "string") {
        insertionLength += insertBefore.length;
        return insertBefore + item;
      } else if (typeof insertBefore === "function") {
        const insertionResult = insertBefore(item, index);
        insertionLength += insertionResult.length;
        return insertBefore(item, index) + item;
      }
      throw Error("insertion is expected to be either a string or a function");
    })
    .join("\n");

  return { modifiedText, insertionLength };
}
