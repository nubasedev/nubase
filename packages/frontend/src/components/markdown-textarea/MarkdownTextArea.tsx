import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { cn } from "../../styling/cn";
import { TextAreaTextController } from "./text-controller";
import type { MarkdownCommand, TextController } from "./types";

const markdownTextAreaVariants = cva([
  // Layout & Sizing
  "w-full min-h-[200px]",

  // Spacing & Borders
  "px-3 py-2 rounded-md border border-border",

  // Background & Text
  "bg-background text-foreground",
  "font-mono text-sm",

  // Resize behavior
  "resize-vertical",

  // Visual Effects
  "outline-none",

  // Placeholder
  "placeholder:text-muted-foreground",

  // Focus State
  "focus-visible:border-ring",
  "focus-visible:ring-ring/50 focus-visible:ring-[3px]",

  // Disabled State
  "disabled:opacity-50",
  "disabled:cursor-not-allowed",
]);

export interface MarkdownTextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof markdownTextAreaVariants> {
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
      className={cn(markdownTextAreaVariants({ className }))}
      {...props}
    />
  );
});

MarkdownTextArea.displayName = "MarkdownTextArea";

export { markdownTextAreaVariants };
