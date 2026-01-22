import type { Lookup } from "@nubase/core";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { FormControl } from "../../FormControl/FormControl";
import { LookupSelect } from "./LookupSelect";

const meta: Meta<typeof LookupSelect> = {
  title: "Form Controls/LookupSelect",
  component: LookupSelect,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    hasError: {
      control: { type: "boolean" },
    },
    disabled: {
      control: { type: "boolean" },
    },
    clearable: {
      control: { type: "boolean" },
    },
    minQueryLength: {
      control: { type: "number" },
    },
    debounceMs: {
      control: { type: "number" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data for async search simulation
const mockUsers: Lookup[] = [
  {
    id: "1",
    title: "John Doe",
    subtitle: "john.doe@example.com",
    image: "https://i.pravatar.cc/150?u=john",
  },
  {
    id: "2",
    title: "Jane Smith",
    subtitle: "jane.smith@example.com",
    image: "https://i.pravatar.cc/150?u=jane",
  },
  {
    id: "3",
    title: "Bob Johnson",
    subtitle: "bob.johnson@example.com",
    image: "https://i.pravatar.cc/150?u=bob",
  },
  {
    id: "4",
    title: "Alice Brown",
    subtitle: "alice.brown@example.com",
    image: "https://i.pravatar.cc/150?u=alice",
  },
  {
    id: "5",
    title: "Charlie Wilson",
    subtitle: "charlie.wilson@example.com",
    image: "https://i.pravatar.cc/150?u=charlie",
  },
  {
    id: "6",
    title: "Diana Martinez",
    subtitle: "diana.martinez@example.com",
    image: "https://i.pravatar.cc/150?u=diana",
  },
  {
    id: "7",
    title: "Edward Lee",
    subtitle: "edward.lee@example.com",
    image: "https://i.pravatar.cc/150?u=edward",
  },
  {
    id: "8",
    title: "Fiona Garcia",
    subtitle: "fiona.garcia@example.com",
    image: "https://i.pravatar.cc/150?u=fiona",
  },
];

const mockProjects: Lookup[] = [
  { id: "proj-1", title: "Website Redesign", subtitle: "Marketing" },
  { id: "proj-2", title: "Mobile App", subtitle: "Engineering" },
  { id: "proj-3", title: "API Integration", subtitle: "Engineering" },
  { id: "proj-4", title: "Data Migration", subtitle: "Operations" },
  { id: "proj-5", title: "User Research", subtitle: "Product" },
  { id: "proj-6", title: "Security Audit", subtitle: "Security" },
];

// Simulated async search function with delay
const createMockSearch =
  (data: Lookup[], delay = 300) =>
  async (query: string): Promise<Lookup[]> => {
    await new Promise((resolve) => setTimeout(resolve, delay));
    const lowerQuery = query.toLowerCase();
    return data.filter(
      (item) =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.subtitle?.toLowerCase().includes(lowerQuery),
    );
  };

const searchUsers = createMockSearch(mockUsers);
const searchProjects = createMockSearch(mockProjects);

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<string | number | null>(null);

    return (
      <div className="w-80">
        <LookupSelect
          value={value}
          onChange={setValue}
          onSearch={searchUsers}
          placeholder="Search users..."
          onItemSelect={(item) => console.log("Selected item:", item)}
        />
      </div>
    );
  },
};

export const WithPreselectedValue: Story = {
  render: () => {
    const [value, setValue] = useState<string | number | null>("2");

    return (
      <div className="w-80">
        <LookupSelect
          value={value}
          onChange={setValue}
          onSearch={searchUsers}
          initialItem={mockUsers[1]}
          placeholder="Search users..."
        />
      </div>
    );
  },
};

export const WithError: Story = {
  render: () => {
    const [value, setValue] = useState<string | number | null>(null);

    return (
      <div className="w-80">
        <LookupSelect
          value={value}
          onChange={setValue}
          onSearch={searchUsers}
          hasError
          placeholder="This field has an error..."
        />
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => {
    const [value, setValue] = useState<string | number | null>("1");

    return (
      <div className="w-80">
        <LookupSelect
          value={value}
          onChange={setValue}
          onSearch={searchUsers}
          initialItem={mockUsers[0]}
          disabled
          placeholder="This select is disabled..."
        />
      </div>
    );
  },
};

export const EmptyResults: Story = {
  render: () => {
    const [value, setValue] = useState<string | number | null>(null);

    const emptySearch = async (_query: string): Promise<Lookup[]> => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return [];
    };

    return (
      <div className="w-80 space-y-2">
        <p className="text-sm text-muted-foreground">
          Type anything to see empty results message
        </p>
        <LookupSelect
          value={value}
          onChange={setValue}
          onSearch={emptySearch}
          emptyMessage="No users found matching your search"
          placeholder="Search will return no results..."
        />
      </div>
    );
  },
};

export const NotClearable: Story = {
  render: () => {
    const [value, setValue] = useState<string | number | null>("3");

    return (
      <div className="w-80">
        <LookupSelect
          value={value}
          onChange={setValue}
          onSearch={searchUsers}
          initialItem={mockUsers[2]}
          clearable={false}
          placeholder="Select a user (cannot clear)..."
        />
      </div>
    );
  },
};

export const CustomMinQueryLength: Story = {
  render: () => {
    const [value, setValue] = useState<string | number | null>(null);

    return (
      <div className="w-80 space-y-2">
        <p className="text-sm text-muted-foreground">
          Requires at least 3 characters before searching
        </p>
        <LookupSelect
          value={value}
          onChange={setValue}
          onSearch={searchUsers}
          minQueryLength={3}
          placeholder="Type 3+ characters to search..."
        />
      </div>
    );
  },
};

export const CustomDebounce: Story = {
  render: () => {
    const [value, setValue] = useState<string | number | null>(null);

    return (
      <div className="w-80 space-y-2">
        <p className="text-sm text-muted-foreground">
          500ms debounce delay before searching
        </p>
        <LookupSelect
          value={value}
          onChange={setValue}
          onSearch={searchUsers}
          debounceMs={500}
          placeholder="Search with longer debounce..."
        />
      </div>
    );
  },
};

export const WithoutImages: Story = {
  render: () => {
    const [value, setValue] = useState<string | number | null>(null);

    return (
      <div className="w-80">
        <LookupSelect
          value={value}
          onChange={setValue}
          onSearch={searchProjects}
          placeholder="Search projects..."
        />
      </div>
    );
  },
};

export const SlowSearch: Story = {
  render: () => {
    const [value, setValue] = useState<string | number | null>(null);
    const slowSearch = createMockSearch(mockUsers, 1500);

    return (
      <div className="w-80 space-y-2">
        <p className="text-sm text-muted-foreground">
          Simulates a slow API response (1.5s delay)
        </p>
        <LookupSelect
          value={value}
          onChange={setValue}
          onSearch={slowSearch}
          placeholder="Search users (slow)..."
        />
      </div>
    );
  },
};

export const WithFormControl: Story = {
  render: () => {
    const [value, setValue] = useState<string | number | null>(null);
    const [hasError, setHasError] = useState(false);

    return (
      <div className="w-80 space-y-4">
        <FormControl
          label="Assignee"
          hint="Search and select a user to assign this task to"
          error={hasError ? "Please select an assignee" : undefined}
          required
        >
          <LookupSelect
            id="assignee-select"
            value={value}
            onChange={(newValue) => {
              setValue(newValue);
              setHasError(!newValue);
            }}
            onSearch={searchUsers}
            hasError={hasError}
            placeholder="Search for a user..."
          />
        </FormControl>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setHasError(!hasError)}
            className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded"
          >
            Toggle Error
          </button>
          <button
            type="button"
            onClick={() => setValue(null)}
            className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded"
          >
            Clear Value
          </button>
        </div>
      </div>
    );
  },
};

export const SelectedItemDisplay: Story = {
  render: () => {
    const [value, setValue] = useState<string | number | null>(null);
    const [selectedItem, setSelectedItem] = useState<Lookup | null>(null);

    return (
      <div className="w-80 space-y-4">
        <LookupSelect
          value={value}
          onChange={setValue}
          onSearch={searchUsers}
          onItemSelect={setSelectedItem}
          placeholder="Search users..."
        />

        {selectedItem && (
          <div className="p-3 bg-muted rounded-md">
            <h4 className="font-semibold text-foreground">Selected User:</h4>
            <p className="text-sm text-muted-foreground">
              ID: {selectedItem.id}
            </p>
            <p className="text-sm text-muted-foreground">
              Name: {selectedItem.title}
            </p>
            {selectedItem.subtitle && (
              <p className="text-sm text-muted-foreground">
                Email: {selectedItem.subtitle}
              </p>
            )}
          </div>
        )}
      </div>
    );
  },
};

export const InteractiveDemo: Story = {
  render: () => {
    const [value, setValue] = useState<string | number | null>(null);
    const [selectedItem, setSelectedItem] = useState<Lookup | null>(null);
    const [clearable, setClearable] = useState(true);
    const [disabled, setDisabled] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [minQueryLength, setMinQueryLength] = useState(1);
    const [debounceMs, setDebounceMs] = useState(300);

    return (
      <div className="space-y-6 w-96">
        <div className="p-4 bg-muted rounded-lg space-y-3">
          <h3 className="font-semibold text-foreground">Configuration</h3>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={clearable}
                onChange={(e) => setClearable(e.target.checked)}
                className="rounded"
              />
              Clearable
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={disabled}
                onChange={(e) => setDisabled(e.target.checked)}
                className="rounded"
              />
              Disabled
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={hasError}
                onChange={(e) => setHasError(e.target.checked)}
                className="rounded"
              />
              Has Error
            </label>
          </div>

          <div className="space-y-2">
            <label className="block text-sm">
              Min Query Length: {minQueryLength}
              <input
                type="range"
                min="1"
                max="5"
                value={minQueryLength}
                onChange={(e) => setMinQueryLength(Number(e.target.value))}
                className="w-full"
              />
            </label>

            <label className="block text-sm">
              Debounce: {debounceMs}ms
              <input
                type="range"
                min="100"
                max="1000"
                step="100"
                value={debounceMs}
                onChange={(e) => setDebounceMs(Number(e.target.value))}
                className="w-full"
              />
            </label>
          </div>
        </div>

        <LookupSelect
          value={value}
          onChange={setValue}
          onSearch={searchUsers}
          onItemSelect={setSelectedItem}
          clearable={clearable}
          disabled={disabled}
          hasError={hasError}
          minQueryLength={minQueryLength}
          debounceMs={debounceMs}
          placeholder="Interactive demo search..."
        />

        {selectedItem && (
          <div className="p-3 bg-secondary text-secondary-foreground rounded-md">
            <h4 className="font-semibold">Selected User:</h4>
            <p className="text-sm">ID: {selectedItem.id}</p>
            <p className="text-sm">Name: {selectedItem.title}</p>
            {selectedItem.subtitle && (
              <p className="text-sm">Email: {selectedItem.subtitle}</p>
            )}
          </div>
        )}
      </div>
    );
  },
};
