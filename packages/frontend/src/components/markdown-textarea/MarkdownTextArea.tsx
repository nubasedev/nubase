import type React from "react";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { cn } from "../../styling/cn";
import { TextAreaTextController } from "./text-controller";
import type { MarkdownCommand, TextController } from "./types";

export interface MarkdownTextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

export interface MarkdownTextAreaHandle {
  executeCommand: (command: MarkdownCommand) => void;
  getTextController: () => TextController;
}

export const MarkdownTextArea = forwardRef<
  MarkdownTextAreaHandle,
  MarkdownTextAreaProps
>(({ className, ...props }, ref) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const textControllerRef = useRef<TextController | undefined>(undefined);

  const getTextController = () => {
    if (!textControllerRef.current) {
      textControllerRef.current = new TextAreaTextController(
        textAreaRef as React.RefObject<HTMLTextAreaElement>,
      );
    }
    return textControllerRef.current;
  };

  const executeCommand = (command: MarkdownCommand) => {
    const textController = getTextController();
    const initialState = textController.getState();

    if (command.shouldUndo?.({ initialState }) && command.undo) {
      command.undo({ initialState, textApi: textController });
    } else {
      command.execute({ initialState, textApi: textController });
    }
  };

  useImperativeHandle(ref, () => ({
    executeCommand,
    getTextController,
  }));

  return (
    <textarea
      ref={textAreaRef}
      className={cn(
        "w-full min-h-[200px] px-3 py-2",
        "bg-background text-foreground",
        "border border-border rounded-md",
        "resize-vertical",
        "focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "placeholder:text-muted-foreground",
        "font-mono text-sm",
        className,
      )}
      {...props}
    />
  );
});

MarkdownTextArea.displayName = "MarkdownTextArea";
