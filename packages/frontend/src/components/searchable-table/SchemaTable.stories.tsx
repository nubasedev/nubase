import { nu } from "@nubase/core";
import type { Meta, StoryObj } from "@storybook/react";
import { SchemaTable } from "./SchemaTable";

const ticketSchema = nu
  .object({
    id: nu.number(),
    title: nu.string(),
    description: nu.string().optional(),
  })
  .withId("id")
  .withTableLayout({
    fields: [
      { name: "id", label: "ID", columnWidthPx: 80, pinned: true },
      { name: "title", label: "Title", columnWidthPx: 300 },
      { name: "description", label: "Description", columnWidthPx: 400 },
    ],
  });

const sampleRows = [
  { id: 1, title: "Login bug on Safari", description: "Users can't sign in" },
  { id: 2, title: "Dark mode color", description: "Inputs hard to read" },
  { id: 3, title: "Add CSV export", description: "Reports view needs export" },
  { id: 4, title: "Pagination off-by-one", description: "Last page is empty" },
  { id: 5, title: "Slow query on /search", description: "200+ ms response" },
];

const meta: Meta<typeof SchemaTable> = {
  title: "Searchable Table/SchemaTable",
  component: SchemaTable,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="h-[500px] w-full p-4">
      <SchemaTable
        schema={ticketSchema}
        rows={sampleRows}
        onRowClick={(row) => console.log("clicked row", row)}
      />
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div className="h-[500px] w-full p-4">
      <SchemaTable schema={ticketSchema} rows={[]} />
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div className="h-[500px] w-full p-4">
      <SchemaTable schema={ticketSchema} rows={sampleRows} loading />
    </div>
  ),
};
