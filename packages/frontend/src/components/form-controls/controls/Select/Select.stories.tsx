import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { FormControl } from "../../FormControl/FormControl";
import { Select, type SelectOption } from "./Select";

const meta: Meta<typeof Select> = {
  title: "Form Controls/Select",
  component: Select,
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
    loading: {
      control: { type: "boolean" },
    },
    clearable: {
      control: { type: "boolean" },
    },
    searchable: {
      control: { type: "boolean" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample data types and options
interface User {
  id: number;
  name: string;
  role: string;
}

interface Country {
  code: string;
  name: string;
  continent: string;
}

const users: SelectOption<User>[] = [
  {
    value: { id: 1, name: "John Doe", role: "Admin" },
    label: "John Doe (Admin)",
  },
  {
    value: { id: 2, name: "Jane Smith", role: "User" },
    label: "Jane Smith (User)",
  },
  {
    value: { id: 3, name: "Bob Johnson", role: "Moderator" },
    label: "Bob Johnson (Moderator)",
  },
  {
    value: { id: 4, name: "Alice Brown", role: "User" },
    label: "Alice Brown (User)",
  },
  {
    value: { id: 5, name: "Charlie Wilson", role: "User" },
    label: "Charlie Wilson (User)",
  },
];

const countries: SelectOption<Country>[] = [
  {
    value: { code: "US", name: "United States", continent: "North America" },
    label: "United States",
  },
  {
    value: { code: "CA", name: "Canada", continent: "North America" },
    label: "Canada",
  },
  {
    value: { code: "MX", name: "Mexico", continent: "North America" },
    label: "Mexico",
  },
  {
    value: { code: "BR", name: "Brazil", continent: "South America" },
    label: "Brazil",
  },
  {
    value: { code: "AR", name: "Argentina", continent: "South America" },
    label: "Argentina",
  },
  {
    value: { code: "UK", name: "United Kingdom", continent: "Europe" },
    label: "United Kingdom",
  },
  {
    value: { code: "FR", name: "France", continent: "Europe" },
    label: "France",
  },
  {
    value: { code: "DE", name: "Germany", continent: "Europe" },
    label: "Germany",
  },
  { value: { code: "JP", name: "Japan", continent: "Asia" }, label: "Japan" },
  { value: { code: "CN", name: "China", continent: "Asia" }, label: "China" },
  { value: { code: "IN", name: "India", continent: "Asia" }, label: "India" },
  {
    value: { code: "AU", name: "Australia", continent: "Oceania" },
    label: "Australia",
  },
];

const simpleOptions: SelectOption<string>[] = [
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" },
  { value: "option4", label: "Option 4" },
  { value: "option5", label: "Option 5" },
];

const optionsWithDisabled: SelectOption<string>[] = [
  { value: "enabled1", label: "Enabled Option 1" },
  { value: "disabled1", label: "Disabled Option 1", disabled: true },
  { value: "enabled2", label: "Enabled Option 2" },
  { value: "disabled2", label: "Disabled Option 2", disabled: true },
  { value: "enabled3", label: "Enabled Option 3" },
];

const SelectWrapper = (args: any) => {
  const [value, setValue] = useState(args.value);

  return (
    <div className="w-80">
      <Select
        {...args}
        value={value}
        onChange={setValue}
        onSelectionChange={(item) => {
          console.log("Selected item:", item);
        }}
      />
    </div>
  );
};

export const Default: Story = {
  render: SelectWrapper,
  args: {
    options: simpleOptions,
    placeholder: "Choose an option...",
  },
};

export const WithPreselectedValue: Story = {
  render: SelectWrapper,
  args: {
    options: simpleOptions,
    value: "option2",
    placeholder: "Choose an option...",
  },
};

export const WithError: Story = {
  render: SelectWrapper,
  args: {
    options: simpleOptions,
    hasError: true,
    placeholder: "This field has an error...",
  },
};

export const Disabled: Story = {
  render: SelectWrapper,
  args: {
    options: simpleOptions,
    disabled: true,
    placeholder: "This select is disabled...",
  },
};

export const Loading: Story = {
  render: SelectWrapper,
  args: {
    options: [],
    loading: true,
    loadingMessage: "Loading options...",
  },
};

export const EmptyOptions: Story = {
  render: SelectWrapper,
  args: {
    options: [],
    emptyMessage: "No options available",
    placeholder: "No options to choose from...",
  },
};

export const Clearable: Story = {
  render: SelectWrapper,
  args: {
    options: simpleOptions,
    value: "option2",
    clearable: true,
    placeholder: "Clearable select...",
  },
};

export const Searchable: Story = {
  render: SelectWrapper,
  args: {
    options: countries,
    searchable: true,
    placeholder: "Search countries...",
  },
};

export const SearchableAndClearable: Story = {
  render: SelectWrapper,
  args: {
    options: countries,
    searchable: true,
    clearable: true,
    value: { code: "US", name: "United States", continent: "North America" },
    placeholder: "Search and clear countries...",
  },
};

export const WithDisabledOptions: Story = {
  render: SelectWrapper,
  args: {
    options: optionsWithDisabled,
    placeholder: "Some options are disabled...",
  },
};

export const ComplexObjectValues: Story = {
  render: (args) => {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    return (
      <div className="w-80 space-y-4">
        <Select
          {...args}
          value={selectedUser}
          onChange={setSelectedUser}
          onSelectionChange={(item) => {
            console.log("Selected user:", item?.value);
          }}
        />
        {selectedUser && (
          <div className="p-3 bg-muted rounded-md">
            <h4 className="font-semibold text-foreground">Selected User:</h4>
            <p className="text-sm text-muted-foreground">
              ID: {selectedUser.id}
            </p>
            <p className="text-sm text-muted-foreground">
              Name: {selectedUser.name}
            </p>
            <p className="text-sm text-muted-foreground">
              Role: {selectedUser.role}
            </p>
          </div>
        )}
      </div>
    );
  },
  args: {
    options: users,
    placeholder: "Select a user...",
    clearable: true,
  },
};

export const CustomFilterFunction: Story = {
  render: (args) => {
    const [value, setValue] = useState<Country | null>(null);

    // Custom filter that searches by country name or continent
    const customFilter = (
      options: SelectOption<Country>[],
      inputValue: string,
    ) => {
      const searchTerm = inputValue.toLowerCase();
      return options.filter(
        (option) =>
          option.value.name.toLowerCase().includes(searchTerm) ||
          option.value.continent.toLowerCase().includes(searchTerm),
      );
    };

    return (
      <div className="w-80 space-y-4">
        <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground">
          <p>
            Try searching by country name (e.g., "United") or continent (e.g.,
            "Europe")
          </p>
        </div>
        <Select
          {...args}
          value={value}
          onChange={setValue}
          filterOptions={customFilter}
        />
      </div>
    );
  },
  args: {
    options: countries,
    searchable: true,
    clearable: true,
    placeholder: "Search by country or continent...",
  },
};

export const WithFormControl: Story = {
  render: (args) => {
    const [value, setValue] = useState<string | null>(null);
    const [hasError, setHasError] = useState(false);

    return (
      <div className="w-80 space-y-4">
        <FormControl
          label="Favorite Option"
          hint="Choose your favorite option from the list"
          error={hasError ? "This field is required" : undefined}
          required
        >
          <Select
            {...args}
            id="favorite-select"
            value={value}
            onChange={(newValue) => {
              setValue(newValue);
              setHasError(!newValue);
            }}
            hasError={hasError}
          />
        </FormControl>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setHasError(!hasError)}
            className="px-3 py-1 text-sm bg-secondary text-onSecondary rounded"
          >
            Toggle Error
          </button>
          <button
            type="button"
            onClick={() => setValue(null)}
            className="px-3 py-1 text-sm bg-secondary text-onSecondary rounded"
          >
            Clear Value
          </button>
        </div>
      </div>
    );
  },
  args: {
    options: simpleOptions,
    placeholder: "Select your favorite...",
    clearable: true,
  },
};

export const AsyncLoadingSimulation: Story = {
  render: (args) => {
    const [options, setOptions] = useState<SelectOption<string>[]>([]);
    const [loading, setLoading] = useState(false);
    const [value, setValue] = useState<string | null>(null);

    const loadOptions = () => {
      setLoading(true);
      setOptions([]);
      setValue(null);

      // Simulate API call
      setTimeout(() => {
        setOptions([
          { value: "async1", label: "Async Option 1" },
          { value: "async2", label: "Async Option 2" },
          { value: "async3", label: "Async Option 3" },
          { value: "async4", label: "Async Option 4" },
          { value: "async5", label: "Async Option 5" },
        ]);
        setLoading(false);
      }, 2000);
    };

    return (
      <div className="w-80 space-y-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={loadOptions}
            disabled={loading}
            className="px-3 py-1 text-sm bg-primary text-onPrimary rounded disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load Options"}
          </button>
        </div>

        <Select
          {...args}
          options={options}
          loading={loading}
          value={value}
          onChange={setValue}
          loadingMessage="Fetching options..."
        />
      </div>
    );
  },
  args: {
    placeholder: "Click 'Load Options' to start...",
    clearable: true,
  },
};

export const InteractiveDemo: Story = {
  render: (_args) => {
    const [value, setValue] = useState<Country | null>(null);
    const [searchable, setSearchable] = useState(true);
    const [clearable, setClearable] = useState(true);
    const [disabled, setDisabled] = useState(false);
    const [hasError, setHasError] = useState(false);

    return (
      <div className="space-y-6 w-96">
        <div className="p-4 bg-muted rounded-lg space-y-3">
          <h3 className="font-semibold text-foreground">Configuration</h3>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={searchable}
                onChange={(e) => setSearchable(e.target.checked)}
                className="rounded"
              />
              Searchable
            </label>

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
        </div>

        <Select
          options={countries}
          value={value}
          onChange={setValue}
          searchable={searchable}
          clearable={clearable}
          disabled={disabled}
          hasError={hasError}
          placeholder="Interactive demo select..."
        />

        {value && (
          <div className="p-3 bg-secondary text-secondary-foreground rounded-md">
            <h4 className="font-semibold">Selected Country:</h4>
            <p className="text-sm">Name: {value.name}</p>
            <p className="text-sm">Code: {value.code}</p>
            <p className="text-sm">Continent: {value.continent}</p>
          </div>
        )}
      </div>
    );
  },
  args: {},
};
