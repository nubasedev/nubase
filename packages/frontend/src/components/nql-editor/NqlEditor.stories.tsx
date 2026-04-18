import { nu } from "@nubase/core";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { NqlEditor } from "./NqlEditor";

const ticketSchema = nu.object({
  id: nu.number(),
  title: nu.string(),
  description: nu.string().optional(),
  assigneeId: nu.number().optional(),
  assigneeName: nu.string().optional(),
  assigneeEmail: nu.string().optional(),
  done: nu.boolean(),
});

const meta: Meta<typeof NqlEditor> = {
  title: "Form Controls/NqlEditor",
  component: NqlEditor,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof NqlEditor>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <div className="w-[640px] space-y-2">
        <NqlEditor schema={ticketSchema} value={value} onChange={setValue} />
        <pre className="text-xs text-muted-foreground">
          {value || "(empty)"}
        </pre>
      </div>
    );
  },
};

export const WithInitialQuery: Story = {
  render: () => {
    const [value, setValue] = useState(
      '(Title CONTAINS "override" OR Title CONTAINS "vulnerability") AND Description STARTS_WITH "Bibo"',
    );
    return (
      <div className="w-[720px] space-y-2">
        <NqlEditor
          schema={ticketSchema}
          value={value}
          onChange={setValue}
          height={80}
        />
      </div>
    );
  },
};

export const WithError: Story = {
  render: () => {
    const [value, setValue] = useState('nope = "x"');
    return (
      <div className="w-[640px]">
        <NqlEditor
          schema={ticketSchema}
          value={value}
          onChange={setValue}
          errorMessage="Unknown field 'nope'"
        />
      </div>
    );
  },
};
