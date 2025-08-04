import type { RefObject } from "react";
import type { SelectionRange, TextController, TextState } from "./types";

export class TextAreaTextController implements TextController {
  textAreaRef: RefObject<HTMLTextAreaElement>;

  constructor(textAreaRef: RefObject<HTMLTextAreaElement>) {
    this.textAreaRef = textAreaRef;
  }

  replaceSelection(text: string): TextState {
    const textArea = this.textAreaRef.current;
    if (!textArea) {
      throw new Error("TextAreaRef is not set");
    }
    insertText(textArea, text);
    return getStateFromTextArea(textArea);
  }

  setSelectionRange(selection: SelectionRange): TextState {
    const textArea = this.textAreaRef.current;
    if (!textArea) {
      throw new Error("TextAreaRef is not set");
    }
    textArea.focus();
    textArea.selectionStart = selection.start;
    textArea.selectionEnd = selection.end;
    return getStateFromTextArea(textArea);
  }

  getState(): TextState {
    const textArea = this.textAreaRef.current;
    if (!textArea) {
      throw new Error("TextAreaRef is not set");
    }
    return getStateFromTextArea(textArea);
  }
}

export function getStateFromTextArea(textArea: HTMLTextAreaElement): TextState {
  return {
    selection: {
      start: textArea.selectionStart,
      end: textArea.selectionEnd,
    },
    text: textArea.value,
  };
}

export function insertText(
  input: HTMLTextAreaElement | HTMLInputElement,
  text: string,
) {
  input.focus();

  if ((document as any).selection) {
    const ieRange = (document as any).selection.createRange();
    ieRange.text = text;
    ieRange.collapse(false);
    ieRange.select();
    return;
  }

  const isSuccess = document.execCommand("insertText", false, text);
  if (!isSuccess) {
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;

    if (typeof (input as any).setRangeText === "function") {
      (input as any).setRangeText(text);
    } else {
      if (canManipulateViaTextNodes(input)) {
        const textNode = document.createTextNode(text);
        let node = input.firstChild;

        if (!node) {
          input.appendChild(textNode);
        } else {
          let offset = 0;
          let startNode = null;
          let endNode = null;

          const range = document.createRange();

          while (node && (startNode === null || endNode === null)) {
            const nodeLength = node.nodeValue?.length || 0;

            if (start >= offset && start <= offset + nodeLength) {
              startNode = node;
              range.setStart(startNode, start - offset);
            }

            if (end >= offset && end <= offset + nodeLength) {
              endNode = node;
              range.setEnd(endNode, end - offset);
            }

            offset += nodeLength;
            node = node.nextSibling;
          }

          if (start !== end) {
            range.deleteContents();
          }

          range.insertNode(textNode);
        }
      } else {
        const value = input.value;
        input.value = value.slice(0, start) + text + value.slice(end);
      }
    }

    input.setSelectionRange(start + text.length, start + text.length);

    const e = document.createEvent("UIEvent");
    e.initEvent("input", true, false);
    input.dispatchEvent(e);
  }
}

function canManipulateViaTextNodes(
  input: HTMLTextAreaElement | HTMLInputElement,
) {
  if (input.nodeName !== "TEXTAREA") {
    return false;
  }
  let browserSupportsTextareaTextNodes: boolean | undefined;
  if (typeof browserSupportsTextareaTextNodes === "undefined") {
    const textarea = document.createElement("textarea");
    textarea.value = "1";
    browserSupportsTextareaTextNodes = !!textarea.firstChild;
  }
  return browserSupportsTextareaTextNodes;
}
