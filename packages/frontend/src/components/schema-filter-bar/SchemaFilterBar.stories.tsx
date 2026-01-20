import { nu } from "@nubase/core";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { introspectSchemaForFilters } from "./introspect-schema";
import { SchemaFilterBar } from "./SchemaFilterBar";

const meta: Meta<typeof SchemaFilterBar> = {
  title: "Search Filters/SchemaFilterBar",
  component: SchemaFilterBar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample schema that demonstrates different field types
const ticketFilterSchema = nu.object({
  title: nu.string().optional().withComputedMeta({
    label: "Title",
    description: "Filter by ticket title",
  }),
  assigneeId: nu.number().optional().withComputedMeta({
    label: "Assignee",
    description: "Filter by assignee",
    renderer: "lookup",
    lookupResource: "user",
  }),
  isActive: nu.boolean().optional().withComputedMeta({
    label: "Active",
    description: "Filter by active status",
  }),
  priority: nu.string().optional().withComputedMeta({
    label: "Priority",
    description: "Filter by priority level",
  }),
});

export const Default: Story = {
  render: () => {
    const [filterState, setFilterState] = useState<Record<string, unknown>>({});

    const filterDescriptors = introspectSchemaForFilters(ticketFilterSchema);

    const handleFilterChange = (field: string, value: unknown) => {
      setFilterState((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

    const handleClearFilters = () => {
      setFilterState({});
    };

    const hasActiveFilters = Object.values(filterState).some((v) => {
      if (v === undefined || v === null || v === "") return false;
      if (Array.isArray(v) && v.length === 0) return false;
      return true;
    });

    return (
      <SchemaFilterBar
        filterDescriptors={filterDescriptors}
        filterState={filterState}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        showClearFilters={hasActiveFilters}
      />
    );
  },
};

export const WithActiveTextFilter: Story = {
  render: () => {
    const [filterState, setFilterState] = useState<Record<string, unknown>>({
      title: "urgent bug",
    });

    const filterDescriptors = introspectSchemaForFilters(ticketFilterSchema);

    const handleFilterChange = (field: string, value: unknown) => {
      setFilterState((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

    const handleClearFilters = () => {
      setFilterState({});
    };

    const hasActiveFilters = Object.values(filterState).some((v) => {
      if (v === undefined || v === null || v === "") return false;
      if (Array.isArray(v) && v.length === 0) return false;
      return true;
    });

    return (
      <SchemaFilterBar
        filterDescriptors={filterDescriptors}
        filterState={filterState}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        showClearFilters={hasActiveFilters}
      />
    );
  },
};

// Schema with text fields only
const textOnlySchema = nu.object({
  name: nu.string().optional().withComputedMeta({
    label: "Name",
    description: "Filter by name",
  }),
  email: nu.string().optional().withComputedMeta({
    label: "Email",
    description: "Filter by email address",
  }),
  department: nu.string().optional().withComputedMeta({
    label: "Department",
    description: "Filter by department",
  }),
});

export const TextFiltersOnly: Story = {
  render: () => {
    const [filterState, setFilterState] = useState<Record<string, unknown>>({});

    const filterDescriptors = introspectSchemaForFilters(textOnlySchema);

    const handleFilterChange = (field: string, value: unknown) => {
      setFilterState((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

    const handleClearFilters = () => {
      setFilterState({});
    };

    const hasActiveFilters = Object.values(filterState).some((v) => {
      if (v === undefined || v === null || v === "") return false;
      if (Array.isArray(v) && v.length === 0) return false;
      return true;
    });

    return (
      <SchemaFilterBar
        filterDescriptors={filterDescriptors}
        filterState={filterState}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        showClearFilters={hasActiveFilters}
      />
    );
  },
};

// Schema with boolean filter
const booleanSchema = nu.object({
  isVerified: nu.boolean().optional().withComputedMeta({
    label: "Verified",
    description: "Filter by verification status",
  }),
  isActive: nu.boolean().optional().withComputedMeta({
    label: "Active",
    description: "Filter by active status",
  }),
});

export const BooleanFiltersOnly: Story = {
  render: () => {
    const [filterState, setFilterState] = useState<Record<string, unknown>>({});

    const filterDescriptors = introspectSchemaForFilters(booleanSchema);

    const handleFilterChange = (field: string, value: unknown) => {
      setFilterState((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

    const handleClearFilters = () => {
      setFilterState({});
    };

    const hasActiveFilters = Object.values(filterState).some((v) => {
      if (v === undefined || v === null || v === "") return false;
      if (Array.isArray(v) && v.length === 0) return false;
      return true;
    });

    return (
      <SchemaFilterBar
        filterDescriptors={filterDescriptors}
        filterState={filterState}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        showClearFilters={hasActiveFilters}
      />
    );
  },
};

// Schema with custom labels
const customLabelsSchema = nu.object({
  title: nu.string().optional(),
  status: nu.string().optional(),
  createdBy: nu.string().optional(),
});

export const WithCustomLabels: Story = {
  render: () => {
    const [filterState, setFilterState] = useState<Record<string, unknown>>({});

    const filterDescriptors = introspectSchemaForFilters(customLabelsSchema, {
      labels: {
        title: "Ticket Title",
        status: "Current Status",
        createdBy: "Created By User",
      },
    });

    const handleFilterChange = (field: string, value: unknown) => {
      setFilterState((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

    const handleClearFilters = () => {
      setFilterState({});
    };

    const hasActiveFilters = Object.values(filterState).some((v) => {
      if (v === undefined || v === null || v === "") return false;
      if (Array.isArray(v) && v.length === 0) return false;
      return true;
    });

    return (
      <SchemaFilterBar
        filterDescriptors={filterDescriptors}
        filterState={filterState}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        showClearFilters={hasActiveFilters}
      />
    );
  },
};

// Schema with excluded fields
const excludeFieldsSchema = nu.object({
  title: nu.string().optional().withComputedMeta({ label: "Title" }),
  description: nu
    .string()
    .optional()
    .withComputedMeta({ label: "Description" }),
  createdAt: nu.string().optional().withComputedMeta({ label: "Created At" }),
  updatedAt: nu.string().optional().withComputedMeta({ label: "Updated At" }),
});

export const WithExcludedFields: Story = {
  render: () => {
    const [filterState, setFilterState] = useState<Record<string, unknown>>({});

    // Exclude createdAt and updatedAt from filters
    const filterDescriptors = introspectSchemaForFilters(excludeFieldsSchema, {
      excludeFields: ["createdAt", "updatedAt"],
    });

    const handleFilterChange = (field: string, value: unknown) => {
      setFilterState((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

    const handleClearFilters = () => {
      setFilterState({});
    };

    const hasActiveFilters = Object.values(filterState).some((v) => {
      if (v === undefined || v === null || v === "") return false;
      if (Array.isArray(v) && v.length === 0) return false;
      return true;
    });

    return (
      <SchemaFilterBar
        filterDescriptors={filterDescriptors}
        filterState={filterState}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        showClearFilters={hasActiveFilters}
      />
    );
  },
};

export const NoClearButton: Story = {
  render: () => {
    const [filterState, setFilterState] = useState<Record<string, unknown>>({});

    const filterDescriptors = introspectSchemaForFilters(textOnlySchema);

    const handleFilterChange = (field: string, value: unknown) => {
      setFilterState((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

    return (
      <SchemaFilterBar
        filterDescriptors={filterDescriptors}
        filterState={filterState}
        onFilterChange={handleFilterChange}
        showClearFilters={false}
      />
    );
  },
};
