import type { Meta, StoryObj } from "@storybook/react";
import { DataState } from "./DataState";

const meta: Meta<typeof DataState> = {
  title: "Data Display/DataState",
  component: DataState,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div style={{ width: "600px" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  render: () => (
    <DataState isLoading loadingLabel="Loading search results...">
      <div>This content will not be shown</div>
    </DataState>
  ),
};

export const ErrorState: Story = {
  render: () => (
    <DataState error={new Error("Network request failed")}>
      <div>This content will not be shown</div>
    </DataState>
  ),
};

export const ErrorWithCustomMessage: Story = {
  render: () => (
    <DataState
      error={new Error("Network request failed")}
      errorMessage="Unable to connect to the server. Please try again later."
    >
      <div>This content will not be shown</div>
    </DataState>
  ),
};

export const Empty: Story = {
  render: () => (
    <DataState isEmpty>
      <div>This content will not be shown</div>
    </DataState>
  ),
};

export const EmptyWithCustomMessage: Story = {
  render: () => (
    <DataState isEmpty emptyMessage="No tickets match your search criteria">
      <div>This content will not be shown</div>
    </DataState>
  ),
};

export const WithData: Story = {
  render: () => (
    <DataState>
      <div className="p-4 border border-outline rounded-lg">
        <h3 className="text-lg font-medium mb-2">Data Loaded Successfully</h3>
        <p className="text-muted-foreground">
          This content is shown when isLoading is false, error is null, and
          isEmpty is false.
        </p>
      </div>
    </DataState>
  ),
};

export const SimulatedDataFetch: Story = {
  render: () => {
    const data = [
      { id: 1, name: "Item 1" },
      { id: 2, name: "Item 2" },
      { id: 3, name: "Item 3" },
    ];

    return (
      <DataState
        isLoading={false}
        error={null}
        isEmpty={data.length === 0}
        emptyMessage="No items found"
        loadingLabel="Loading items..."
      >
        <ul className="space-y-2">
          {data.map((item) => (
            <li
              key={item.id}
              className="p-3 bg-surface border border-outline rounded"
            >
              {item.name}
            </li>
          ))}
        </ul>
      </DataState>
    );
  },
};
