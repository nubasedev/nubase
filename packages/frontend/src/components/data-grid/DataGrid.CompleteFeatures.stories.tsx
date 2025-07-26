import type { Meta, StoryObj } from "@storybook/react";
import { useMemo, useState } from "react";
import { DataGrid } from "./DataGrid";
import type { Column, SortColumn } from "./types";

const meta: Meta<typeof DataGrid> = {
  title: "Data Grid/Complete Features",
  component: DataGrid,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof DataGrid>;

// Generate a large dataset for performance testing
interface CompleteDataRow {
  id: number;
  name: string;
  email: string;
  department: string;
  position: string;
  salary: number;
  startDate: string;
  location: string;
  manager: string;
  phone: string;
  status: string;
  projects: number;
  experience: number;
  rating: number;
  bonus: number;
  benefits: string;
  notes: string;
  lastReview: string;
  nextReview: string;
  skills: string;
}

const departments = [
  "Engineering",
  "Marketing",
  "Sales",
  "HR",
  "Finance",
  "Operations",
  "Design",
  "Product",
];
const positions = [
  "Junior",
  "Senior",
  "Lead",
  "Manager",
  "Director",
  "VP",
  "Principal",
  "Staff",
];
const locations = [
  "New York",
  "San Francisco",
  "London",
  "Berlin",
  "Tokyo",
  "Sydney",
  "Toronto",
  "Austin",
];
const statuses = ["Active", "On Leave", "Remote", "Part-time", "Contract"];
const names = [
  "John Smith",
  "Jane Doe",
  "Mike Johnson",
  "Sarah Wilson",
  "David Brown",
  "Emma Davis",
  "Chris Miller",
  "Lisa Garcia",
];
const skills = [
  "JavaScript",
  "Python",
  "React",
  "Node.js",
  "TypeScript",
  "AWS",
  "Docker",
  "Kubernetes",
];

function generateCompleteData(count: number): CompleteDataRow[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `${names[i % names.length] ?? "Unknown"} ${Math.floor(i / names.length) + 1}`,
    email: `user${i + 1}@company.com`,
    department: departments[i % departments.length] ?? "Unknown",
    position: positions[i % positions.length] ?? "Unknown",
    salary: 50000 + Math.floor(Math.random() * 150000),
    startDate:
      new Date(
        2018 + Math.floor(Math.random() * 6),
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1,
      )
        .toISOString()
        .split("T")[0] ?? "2020-01-01",
    location: locations[i % locations.length] ?? "Unknown",
    manager: names[(i + 3) % names.length] ?? "Unknown",
    phone: `+1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`,
    status: statuses[i % statuses.length] ?? "Unknown",
    projects: Math.floor(Math.random() * 20) + 1,
    experience: Math.floor(Math.random() * 15) + 1,
    rating: Math.round((Math.random() * 4 + 1) * 10) / 10,
    bonus: Math.floor(Math.random() * 25000),
    benefits: Math.random() > 0.5 ? "Full Package" : "Basic",
    notes: `Employee notes for ${names[i % names.length] ?? "Unknown"}`,
    lastReview:
      new Date(
        2023,
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1,
      )
        .toISOString()
        .split("T")[0] ?? "2023-01-01",
    nextReview:
      new Date(
        2024,
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1,
      )
        .toISOString()
        .split("T")[0] ?? "2023-01-01",
    skills: skills.slice(0, Math.floor(Math.random() * 4) + 2).join(", "),
  }));
}

export const LargeDatasetWithAllFeatures: Story = {
  render: () => {
    const [rows] = useState(() => generateCompleteData(10000));
    const [sortColumns, setSortColumns] = useState<readonly SortColumn[]>([]);

    const columns: Column<CompleteDataRow>[] = useMemo(
      () => [
        // Pinned columns (first 3)
        {
          key: "id",
          name: "ID",
          width: 80,
          frozen: true,
          resizable: true,
          sortable: true,
        },
        {
          key: "name",
          name: "Full Name",
          width: 150,
          frozen: true,
          resizable: true,
          sortable: true,
        },
        {
          key: "department",
          name: "Department",
          width: 120,
          frozen: true,
          resizable: true,
          sortable: true,
        },
        // Regular scrollable columns
        {
          key: "email",
          name: "Email",
          width: 200,
          resizable: true,
          sortable: true,
        },
        {
          key: "position",
          name: "Position",
          width: 120,
          resizable: true,
          sortable: true,
        },
        {
          key: "salary",
          name: "Salary",
          width: 100,
          resizable: true,
          sortable: true,
          renderCell: ({ row }) => `$${row.salary.toLocaleString()}`,
        },
        {
          key: "startDate",
          name: "Start Date",
          width: 120,
          resizable: true,
          sortable: true,
        },
        {
          key: "location",
          name: "Location",
          width: 120,
          resizable: true,
          sortable: true,
        },
        {
          key: "manager",
          name: "Manager",
          width: 150,
          resizable: true,
          sortable: true,
        },
        {
          key: "phone",
          name: "Phone",
          width: 140,
          resizable: true,
          sortable: true,
        },
        {
          key: "status",
          name: "Status",
          width: 100,
          resizable: true,
          sortable: true,
          renderCell: ({ row }) => (
            <span
              style={{
                padding: "4px 8px",
                borderRadius: "4px",
                backgroundColor:
                  row.status === "Active" ? "#e8f5e8" : "#fff3cd",
                color: row.status === "Active" ? "#155724" : "#856404",
                fontSize: "12px",
              }}
            >
              {row.status}
            </span>
          ),
        },
        {
          key: "projects",
          name: "Projects",
          width: 100,
          resizable: true,
          sortable: true,
        },
        {
          key: "experience",
          name: "Experience (Years)",
          width: 130,
          resizable: true,
          sortable: true,
        },
        {
          key: "rating",
          name: "Rating",
          width: 80,
          resizable: true,
          sortable: true,
          renderCell: ({ row }) => `⭐ ${row.rating}`,
        },
        {
          key: "bonus",
          name: "Bonus",
          width: 100,
          resizable: true,
          sortable: true,
          renderCell: ({ row }) => `$${row.bonus.toLocaleString()}`,
        },
        {
          key: "benefits",
          name: "Benefits",
          width: 120,
          resizable: true,
          sortable: true,
        },
        {
          key: "lastReview",
          name: "Last Review",
          width: 120,
          resizable: true,
          sortable: true,
        },
        {
          key: "nextReview",
          name: "Next Review",
          width: 120,
          resizable: true,
          sortable: true,
        },
        {
          key: "skills",
          name: "Skills",
          width: 200,
          resizable: true,
          sortable: true,
        },
        {
          key: "notes",
          name: "Notes",
          width: 250,
          resizable: true,
          sortable: true,
        },
      ],
      [],
    );

    const sortedRows = useMemo(() => {
      if (sortColumns.length === 0) return rows;

      return [...rows].sort((a, b) => {
        for (const sort of sortColumns) {
          const { columnKey, direction } = sort;
          const aValue = a[columnKey as keyof CompleteDataRow];
          const bValue = b[columnKey as keyof CompleteDataRow];

          let comparison = 0;
          if (aValue < bValue) comparison = -1;
          if (aValue > bValue) comparison = 1;

          if (comparison !== 0) {
            return direction === "ASC" ? comparison : -comparison;
          }
        }
        return 0;
      });
    }, [rows, sortColumns]);

    return (
      <DataGrid
        columns={columns}
        rows={sortedRows}
        sortColumns={sortColumns}
        onSortColumnsChange={setSortColumns}
        defaultColumnOptions={{
          sortable: true,
          resizable: true,
        }}
        rowHeight={35}
      />
    );
  },
};

export const MediumDatasetQuickDemo: Story = {
  render: () => {
    const [rows] = useState(() => generateCompleteData(1000));
    const [sortColumns, setSortColumns] = useState<readonly SortColumn[]>([
      { columnKey: "salary", direction: "DESC" },
    ]);

    const columns: Column<CompleteDataRow>[] = useMemo(
      () => [
        {
          key: "id",
          name: "ID",
          width: 60,
          frozen: true,
          sortable: true,
        },
        {
          key: "name",
          name: "Name",
          width: 140,
          frozen: true,
          sortable: true,
        },
        {
          key: "department",
          name: "Dept",
          width: 100,
          frozen: true,
          sortable: true,
        },
        {
          key: "position",
          name: "Position",
          width: 120,
          sortable: true,
        },
        {
          key: "salary",
          name: "Salary",
          width: 120,
          sortable: true,
          renderCell: ({ row }) => (
            <span style={{ fontWeight: "600", color: "#2e7d32" }}>
              ${row.salary.toLocaleString()}
            </span>
          ),
        },
        {
          key: "location",
          name: "Location",
          width: 120,
          sortable: true,
        },
        {
          key: "status",
          name: "Status",
          width: 100,
          sortable: true,
          renderCell: ({ row }) => (
            <span
              style={{
                padding: "2px 6px",
                borderRadius: "12px",
                backgroundColor:
                  row.status === "Active" ? "#4caf50" : "#ff9800",
                color: "white",
                fontSize: "11px",
                fontWeight: "500",
              }}
            >
              {row.status}
            </span>
          ),
        },
        {
          key: "rating",
          name: "Rating",
          width: 80,
          sortable: true,
          renderCell: ({ row }) => (
            <span style={{ color: "#f57c00", fontWeight: "600" }}>
              ⭐ {row.rating}
            </span>
          ),
        },
      ],
      [],
    );

    const sortedRows = useMemo(() => {
      if (sortColumns.length === 0) return rows;

      return [...rows].sort((a, b) => {
        for (const sort of sortColumns) {
          const { columnKey, direction } = sort;
          const aValue = a[columnKey as keyof CompleteDataRow];
          const bValue = b[columnKey as keyof CompleteDataRow];

          let comparison = 0;
          if (aValue < bValue) comparison = -1;
          if (aValue > bValue) comparison = 1;

          if (comparison !== 0) {
            return direction === "ASC" ? comparison : -comparison;
          }
        }
        return 0;
      });
    }, [rows, sortColumns]);

    return (
      <div style={{ height: "600px", width: "100%" }}>
        <DataGrid
          columns={columns}
          rows={sortedRows}
          sortColumns={sortColumns}
          onSortColumnsChange={setSortColumns}
          defaultColumnOptions={{
            sortable: true,
            resizable: true,
          }}
        />
      </div>
    );
  },
};
