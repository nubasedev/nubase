import type { Meta, StoryObj } from "@storybook/react";
import { useRef, useState } from "react";
import { Button } from "../buttons/Button/Button";
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
import {
  MarkdownTextArea,
  type MarkdownTextAreaHandle,
} from "./MarkdownTextArea";

const meta = {
  title: "Form Controls/MarkdownTextArea",
  component: MarkdownTextArea,
} satisfies Meta<typeof MarkdownTextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState(
      "Select some text and click the buttons above to apply markdown formatting.\n\nTry selecting a word and making it bold!",
    );
    const markdownRef = useRef<MarkdownTextAreaHandle>(null);

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => markdownRef.current?.executeCommand(boldCommand)}
          >
            Bold
          </Button>
          <Button
            variant="secondary"
            onClick={() => markdownRef.current?.executeCommand(italicCommand)}
          >
            Italic
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              markdownRef.current?.executeCommand(strikethroughCommand)
            }
          >
            Strikethrough
          </Button>
          <Button
            variant="secondary"
            onClick={() => markdownRef.current?.executeCommand(codeCommand)}
          >
            Code
          </Button>
        </div>

        <MarkdownTextArea
          ref={markdownRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type your markdown here..."
        />
      </div>
    );
  },
};

export const WithHeadings: Story = {
  render: () => {
    const [value, setValue] = useState(
      "Place your cursor on this line and click H1\nPlace your cursor here and click H2\nThis line can become H3",
    );
    const markdownRef = useRef<MarkdownTextAreaHandle>(null);

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() =>
              markdownRef.current?.executeCommand(headingCommand(1))
            }
          >
            H1
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              markdownRef.current?.executeCommand(headingCommand(2))
            }
          >
            H2
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              markdownRef.current?.executeCommand(headingCommand(3))
            }
          >
            H3
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              markdownRef.current?.executeCommand(headingCommand(4))
            }
          >
            H4
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              markdownRef.current?.executeCommand(headingCommand(5))
            }
          >
            H5
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              markdownRef.current?.executeCommand(headingCommand(6))
            }
          >
            H6
          </Button>
        </div>

        <MarkdownTextArea
          ref={markdownRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type your markdown here..."
        />
      </div>
    );
  },
};

export const WithLists: Story = {
  render: () => {
    const [value, setValue] = useState(
      "Select these lines\nto convert them\ninto different list types",
    );
    const markdownRef = useRef<MarkdownTextAreaHandle>(null);

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() =>
              markdownRef.current?.executeCommand(unorderedListCommand)
            }
          >
            Bullet List
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              markdownRef.current?.executeCommand(orderedListCommand)
            }
          >
            Numbered List
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              markdownRef.current?.executeCommand(checkListCommand)
            }
          >
            Check List
          </Button>
        </div>

        <MarkdownTextArea
          ref={markdownRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type your markdown here..."
        />
      </div>
    );
  },
};

export const WithLinksAndImages: Story = {
  render: () => {
    const [value, setValue] = useState(
      "Select text to convert to a link or image",
    );
    const markdownRef = useRef<MarkdownTextAreaHandle>(null);

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => markdownRef.current?.executeCommand(linkCommand)}
          >
            Link
          </Button>
          <Button
            variant="secondary"
            onClick={() => markdownRef.current?.executeCommand(imageCommand)}
          >
            Image
          </Button>
        </div>

        <MarkdownTextArea
          ref={markdownRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type your markdown here..."
        />
      </div>
    );
  },
};

export const WithQuotesAndCodeBlocks: Story = {
  render: () => {
    const [value, setValue] = useState(
      "Select this text to make it a quote\n\nconst code = 'Select this to make it a code block';",
    );
    const markdownRef = useRef<MarkdownTextAreaHandle>(null);

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => markdownRef.current?.executeCommand(quoteCommand)}
          >
            Quote
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              markdownRef.current?.executeCommand(codeBlockCommand)
            }
          >
            Code Block
          </Button>
        </div>

        <MarkdownTextArea
          ref={markdownRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type your markdown here..."
        />
      </div>
    );
  },
};

export const CompleteToolbar: Story = {
  render: () => {
    const [value, setValue] = useState(
      `# Markdown Editor Demo

This is a **complete** markdown editor with all formatting options.

## Features

- Text formatting: **bold**, *italic*, ~~strikethrough~~, and \`inline code\`
- Headers (H1-H6)
- Lists (bullet, numbered, checklist)
- Links and images
- Quotes and code blocks

Try selecting text and using the toolbar buttons above!`,
    );
    const markdownRef = useRef<MarkdownTextAreaHandle>(null);

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => markdownRef.current?.executeCommand(boldCommand)}
            >
              Bold
            </Button>
            <Button
              variant="secondary"
              onClick={() => markdownRef.current?.executeCommand(italicCommand)}
            >
              Italic
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                markdownRef.current?.executeCommand(strikethroughCommand)
              }
            >
              Strikethrough
            </Button>
            <Button
              variant="secondary"
              onClick={() => markdownRef.current?.executeCommand(codeCommand)}
            >
              Code
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() =>
                markdownRef.current?.executeCommand(headingCommand(1))
              }
            >
              H1
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                markdownRef.current?.executeCommand(headingCommand(2))
              }
            >
              H2
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                markdownRef.current?.executeCommand(headingCommand(3))
              }
            >
              H3
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                markdownRef.current?.executeCommand(headingCommand(4))
              }
            >
              H4
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                markdownRef.current?.executeCommand(headingCommand(5))
              }
            >
              H5
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                markdownRef.current?.executeCommand(headingCommand(6))
              }
            >
              H6
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() =>
                markdownRef.current?.executeCommand(unorderedListCommand)
              }
            >
              Bullet List
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                markdownRef.current?.executeCommand(orderedListCommand)
              }
            >
              Numbered List
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                markdownRef.current?.executeCommand(checkListCommand)
              }
            >
              Check List
            </Button>
            <Button
              variant="secondary"
              onClick={() => markdownRef.current?.executeCommand(linkCommand)}
            >
              Link
            </Button>
            <Button
              variant="secondary"
              onClick={() => markdownRef.current?.executeCommand(imageCommand)}
            >
              Image
            </Button>
            <Button
              variant="secondary"
              onClick={() => markdownRef.current?.executeCommand(quoteCommand)}
            >
              Quote
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                markdownRef.current?.executeCommand(codeBlockCommand)
              }
            >
              Code Block
            </Button>
          </div>
        </div>

        <MarkdownTextArea
          ref={markdownRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="min-h-[400px]"
        />
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => {
    return (
      <MarkdownTextArea
        value="This textarea is disabled"
        disabled
        placeholder="Disabled textarea..."
      />
    );
  },
};

export const CustomStyling: Story = {
  render: () => {
    const [value, setValue] = useState("");
    const markdownRef = useRef<MarkdownTextAreaHandle>(null);

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => markdownRef.current?.executeCommand(boldCommand)}
          >
            Bold
          </Button>
          <Button
            variant="secondary"
            onClick={() => markdownRef.current?.executeCommand(italicCommand)}
          >
            Italic
          </Button>
        </div>

        <MarkdownTextArea
          ref={markdownRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="min-h-[300px] text-base bg-secondary text-secondary-foreground border-primary"
          placeholder="Custom styled markdown editor..."
        />
      </div>
    );
  },
};
