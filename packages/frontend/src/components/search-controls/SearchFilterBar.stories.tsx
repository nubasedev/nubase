import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { SearchFilterBar } from "./SearchFilterBar";
import { SelectFilter, type SelectFilterOption } from "./SelectFilter";
import { TextFilter } from "./TextFilter";

const meta: Meta<typeof SearchFilterBar> = {
  title: "Search Filters/SearchFilterBar",
  component: SearchFilterBar,
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
];

export const Default: Story = {
  render: () => {
    const [search, setSearch] = useState("");
    const [epicFilter, setEpicFilter] = useState<string[]>([]);
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

export const WithActiveFilters: Story = {
  render: () => {
    const [search, setSearch] = useState("");
    const [epicFilter, setEpicFilter] = useState<string[]>(["epic-1"]);
    const [typeFilter, setTypeFilter] = useState<string[]>(["bug", "story"]);
    const [labelFilter, setLabelFilter] = useState<string[]>(["frontend"]);
    const [quickFilter, setQuickFilter] = useState("urgent");

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

export const WithSearchValue: Story = {
  render: () => {
    const [search, setSearch] = useState("bug fix");
    const [typeFilter, setTypeFilter] = useState<string[]>([]);

    const handleClearFilters = () => {
      setSearch("");
      setTypeFilter([]);
    };

    return (
      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search board"
        onClearFilters={handleClearFilters}
      >
        <SelectFilter
          label="Type"
          options={typeOptions}
          value={typeFilter}
          onChange={setTypeFilter}
        />
      </SearchFilterBar>
    );
  },
};

export const WithoutClearButton: Story = {
  render: () => {
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<string[]>([]);

    return (
      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search..."
        showClearFilters={false}
      >
        <SelectFilter
          label="Type"
          options={typeOptions}
          value={typeFilter}
          onChange={setTypeFilter}
        />
      </SearchFilterBar>
    );
  },
};

export const SearchOnly: Story = {
  render: () => {
    const [search, setSearch] = useState("");

    return (
      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search..."
        showClearFilters={false}
      />
    );
  },
};

export const CustomSearchWidth: Story = {
  render: () => {
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<string[]>([]);

    const handleClearFilters = () => {
      setSearch("");
      setTypeFilter([]);
    };

    return (
      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search board"
        searchWidth={300}
        onClearFilters={handleClearFilters}
      >
        <SelectFilter
          label="Type"
          options={typeOptions}
          value={typeFilter}
          onChange={setTypeFilter}
        />
      </SearchFilterBar>
    );
  },
};

export const Disabled: Story = {
  render: () => {
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<string[]>([]);

    return (
      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search board"
        disabled
        onClearFilters={() => {}}
      >
        <SelectFilter
          label="Type"
          options={typeOptions}
          value={typeFilter}
          onChange={setTypeFilter}
          disabled
        />
      </SearchFilterBar>
    );
  },
};
