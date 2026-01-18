import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { SearchFilterBar } from "./SearchFilterBar";
import { SearchFilterDropdown } from "./SearchFilterDropdown";
import { SelectFilter, type SelectFilterOption } from "./SelectFilter";
import { TextFilter } from "./TextFilter";

const meta: Meta<typeof SearchFilterDropdown> = {
  title: "Search Filters/SearchFilterDropdown",
  component: SearchFilterDropdown,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample data for stories
const epicOptions: SelectFilterOption<string>[] = [
  {
    value: "epic-1",
    label: "[Orion] 2026 Q1 Non-Roadmap Work",
    description: "TESS-16932",
  },
  {
    value: "epic-2",
    label: "[Orion] Scale: Sensitivity auto-scaling",
    description: "TESS-14408",
  },
  {
    value: "epic-3",
    label: "[Orion] Scale: Add limits to architect policy conf...",
    description: "TESS-13900",
  },
  {
    value: "epic-4",
    label: "[Orion] Discovery: Outbound quarantine",
    description: "TESS-14411",
  },
  {
    value: "epic-5",
    label: "[Orion] Algo: Simplifying/fixing the Sensitivity al...",
    description: "TESS-16915",
  },
  {
    value: "epic-6",
    label: "Orion Business as Usual",
    description: "TESS-986",
  },
];

const typeOptions: SelectFilterOption<string>[] = [
  { value: "bug", label: "Bug" },
  { value: "story", label: "Story" },
  { value: "task", label: "Task" },
  { value: "epic", label: "Epic" },
  { value: "subtask", label: "Sub-task" },
];

const labelOptions: SelectFilterOption<string>[] = [
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "design", label: "Design" },
  { value: "documentation", label: "Documentation" },
  { value: "testing", label: "Testing" },
  { value: "infrastructure", label: "Infrastructure" },
  { value: "security", label: "Security" },
  { value: "performance", label: "Performance" },
];

// ============================================
// SearchFilterDropdown Base Component Stories
// ============================================

export const Default: Story = {
  render: () => (
    <SearchFilterDropdown label="Filter">
      <div className="p-4">
        <p className="text-sm text-muted-foreground">
          Custom dropdown content goes here
        </p>
      </div>
    </SearchFilterDropdown>
  ),
};

export const ActiveState: Story = {
  render: () => (
    <SearchFilterDropdown label="Epic" isActive activeCount={1}>
      <div className="p-4">
        <p className="text-sm text-muted-foreground">
          This filter has an active selection
        </p>
      </div>
    </SearchFilterDropdown>
  ),
};

export const ActiveWithMultipleSelections: Story = {
  render: () => (
    <SearchFilterDropdown label="Type" isActive activeCount={3}>
      <div className="p-4">
        <p className="text-sm text-muted-foreground">3 types selected</p>
      </div>
    </SearchFilterDropdown>
  ),
};

export const Disabled: Story = {
  render: () => (
    <SearchFilterDropdown label="Disabled Filter" disabled>
      <div className="p-4">
        <p className="text-sm text-muted-foreground">
          This content won't be shown
        </p>
      </div>
    </SearchFilterDropdown>
  ),
};

// ============================================
// TextFilter Stories
// ============================================

export const TextFilterBasic: Story = {
  render: () => {
    const [value, setValue] = useState("");

    return (
      <TextFilter
        label="Search"
        value={value}
        onChange={setValue}
        placeholder="Search items..."
      />
    );
  },
};

export const TextFilterWithValue: Story = {
  render: () => {
    const [value, setValue] = useState("bug fix");

    return (
      <TextFilter
        label="Search"
        value={value}
        onChange={setValue}
        placeholder="Search items..."
      />
    );
  },
};

export const TextFilterCustomDebounce: Story = {
  render: () => {
    const [value, setValue] = useState("");

    return (
      <TextFilter
        label="Quick Search"
        value={value}
        onChange={setValue}
        placeholder="100ms debounce..."
        debounceMs={100}
      />
    );
  },
};

// ============================================
// SelectFilter Stories
// ============================================

export const SelectFilterBasic: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[]>([]);

    return (
      <SelectFilter
        label="Type"
        options={typeOptions}
        value={selected}
        onChange={setSelected}
      />
    );
  },
};

export const SelectFilterWithSelection: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[]>(["bug", "story"]);

    return (
      <SelectFilter
        label="Type"
        options={typeOptions}
        value={selected}
        onChange={setSelected}
      />
    );
  },
};

export const SelectFilterSearchable: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[]>(["epic-1"]);

    return (
      <SelectFilter
        label="Epic"
        options={epicOptions}
        value={selected}
        onChange={setSelected}
        searchable
        searchPlaceholder="Search Epic filters..."
        dropdownWidth={350}
      />
    );
  },
};

export const SelectFilterWithSelectAllClear: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[]>([]);

    return (
      <SelectFilter
        label="Label"
        options={labelOptions}
        value={selected}
        onChange={setSelected}
        searchable
        showSelectAllClear
        searchPlaceholder="Search labels..."
      />
    );
  },
};

export const SelectFilterManyOptions: Story = {
  render: () => {
    const manyOptions: SelectFilterOption<string>[] = Array.from(
      { length: 50 },
      (_, i) => ({
        value: `option-${i + 1}`,
        label: `Option ${i + 1}`,
        description: `Description for option ${i + 1}`,
      }),
    );

    const [selected, setSelected] = useState<string[]>([
      "option-1",
      "option-5",
      "option-10",
    ]);

    return (
      <SelectFilter
        label="Items"
        options={manyOptions}
        value={selected}
        onChange={setSelected}
        searchable
        showSelectAllClear
        maxHeight={250}
      />
    );
  },
};

export const SelectFilterWithDisabledOptions: Story = {
  render: () => {
    const optionsWithDisabled: SelectFilterOption<string>[] = [
      { value: "option-1", label: "Available Option 1" },
      { value: "option-2", label: "Disabled Option", disabled: true },
      { value: "option-3", label: "Available Option 2" },
      { value: "option-4", label: "Another Disabled", disabled: true },
      { value: "option-5", label: "Available Option 3" },
    ];

    const [selected, setSelected] = useState<string[]>([]);

    return (
      <SelectFilter
        label="Status"
        options={optionsWithDisabled}
        value={selected}
        onChange={setSelected}
      />
    );
  },
};

// ============================================
// Combined Filter Toolbar Stories
// ============================================

export const FilterToolbar: Story = {
  render: () => {
    const [search, setSearch] = useState("");
    const [epicFilter, setEpicFilter] = useState<string[]>(["epic-1"]);
    const [typeFilter, setTypeFilter] = useState<string[]>([]);
    const [labelFilter, setLabelFilter] = useState<string[]>([]);
    const [quickFilter, setQuickFilter] = useState("");

    const handleClearFilters = () => {
      setSearch("");
      setEpicFilter([]);
      setTypeFilter([]);
      setLabelFilter([]);
      setQuickFilter("");
    };

    return (
      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search board"
        onClearFilters={handleClearFilters}
      >
        <SelectFilter
          label="Epic"
          options={epicOptions}
          value={epicFilter}
          onChange={setEpicFilter}
          searchable
          searchPlaceholder="Search Epic filters..."
          dropdownWidth={350}
        />
        <SelectFilter
          label="Type"
          options={typeOptions}
          value={typeFilter}
          onChange={setTypeFilter}
        />
        <SelectFilter
          label="Label"
          options={labelOptions}
          value={labelFilter}
          onChange={setLabelFilter}
          searchable
        />
        <TextFilter
          label="Quick filters"
          value={quickFilter}
          onChange={setQuickFilter}
          placeholder="Filter by keyword..."
        />
      </SearchFilterBar>
    );
  },
};

export const FilterToolbarCompact: Story = {
  render: () => {
    const [search, setSearch] = useState("");
    const [epicFilter, setEpicFilter] = useState<string[]>([]);
    const [typeFilter, setTypeFilter] = useState<string[]>(["bug", "story"]);
    const [labelFilter, setLabelFilter] = useState<string[]>(["frontend"]);

    const handleClearFilters = () => {
      setSearch("");
      setEpicFilter([]);
      setTypeFilter([]);
      setLabelFilter([]);
    };

    return (
      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search board"
        onClearFilters={handleClearFilters}
      >
        <SelectFilter
          label="Epic"
          options={epicOptions}
          value={epicFilter}
          onChange={setEpicFilter}
          searchable
          dropdownWidth={320}
        />
        <SelectFilter
          label="Type"
          options={typeOptions}
          value={typeFilter}
          onChange={setTypeFilter}
        />
        <SelectFilter
          label="Label"
          options={labelOptions}
          value={labelFilter}
          onChange={setLabelFilter}
        />
      </SearchFilterBar>
    );
  },
};
