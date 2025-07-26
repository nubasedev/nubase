import type { Meta, StoryObj } from "@storybook/react";
import { useMemo, useState } from "react";
import { SelectColumn } from "./Columns";
import { DataGrid } from "./DataGrid";
import type { Column } from "./types";

const meta: Meta<typeof DataGrid> = {
  title: "Data Grid/Selection",
  component: DataGrid,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
DataGrid with row selection capabilities. Demonstrates single and multiple row selection,
programmatic selection control, and selection events.
        `,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

interface Person {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  isActive: boolean;
}

const generatePeople = (count: number): Person[] => {
  const departments = ["Engineering", "Sales", "Marketing", "HR", "Finance"];
  const roles = [
    "Manager",
    "Developer",
    "Analyst",
    "Coordinator",
    "Specialist",
  ];
  const names = [
    "Alice Johnson",
    "Bob Smith",
    "Carol Brown",
    "David Wilson",
    "Eva Garcia",
    "Frank Miller",
    "Grace Lee",
    "Henry Davis",
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: names[i % names.length] ?? `Person ${i + 1}`,
    email: `person${i + 1}@company.com`,
    department: departments[i % departments.length] ?? "Department",
    role: roles[i % roles.length] ?? "Role",
    isActive: Math.random() > 0.2,
  }));
};

export const BasicSelection: Story = {
  render: () => {
    const [rows] = useState(() => generatePeople(20));
    const [selectedRows, setSelectedRows] = useState<ReadonlySet<number>>(
      new Set(),
    );

    const columns: Column<Person>[] = useMemo(
      () => [
        SelectColumn,
        { key: "id", name: "ID", width: 60 },
        { key: "name", name: "Name", width: 150 },
        { key: "email", name: "Email", width: 200 },
        { key: "department", name: "Department", width: 120 },
        { key: "role", name: "Role", width: 120 },
        {
          key: "isActive",
          name: "Status",
          width: 100,
          renderCell: ({ row }) => (row.isActive ? "✅ Active" : "⏸️ Inactive"),
        },
      ],
      [],
    );

    return (
      <div style={{ height: "500px", width: "100%" }}>
        <DataGrid
          columns={columns}
          rows={rows}
          selectedRows={selectedRows}
          onSelectedRowsChange={setSelectedRows}
          rowKeyGetter={(row) => row.id}
        />
      </div>
    );
  },
};

export const SelectionWithActions: Story = {
  render: () => {
    const [rows] = useState(() => generatePeople(15));
    const [selectedRows, setSelectedRows] = useState<ReadonlySet<number>>(
      new Set(),
    );

    const columns: Column<Person>[] = useMemo(
      () => [
        SelectColumn,
        { key: "id", name: "ID", width: 60 },
        { key: "name", name: "Name", width: 150 },
        { key: "email", name: "Email", width: 200 },
        { key: "department", name: "Department", width: 120 },
        {
          key: "isActive",
          name: "Status",
          width: 100,
          renderCell: ({ row }) => (row.isActive ? "✅ Active" : "⏸️ Inactive"),
        },
      ],
      [],
    );

    const _handleSelectAll = () => {
      setSelectedRows(new Set(rows.map((row) => row.id)));
    };

    const _handleSelectNone = () => {
      setSelectedRows(new Set());
    };

    const _handleSelectActive = () => {
      setSelectedRows(
        new Set(rows.filter((row) => row.isActive).map((row) => row.id)),
      );
    };

    const _handleSelectInactive = () => {
      setSelectedRows(
        new Set(rows.filter((row) => !row.isActive).map((row) => row.id)),
      );
    };

    return (
      <div style={{ height: "500px", width: "100%" }}>
        <DataGrid
          columns={columns}
          rows={rows}
          selectedRows={selectedRows}
          onSelectedRowsChange={setSelectedRows}
          rowKeyGetter={(row) => row.id}
        />
      </div>
    );
  },
};

export const ConditionalSelection: Story = {
  render: () => {
    const [rows] = useState(() => generatePeople(20));
    const [selectedRows, setSelectedRows] = useState<ReadonlySet<number>>(
      new Set(),
    );

    const columns: Column<Person>[] = useMemo(
      () => [
        SelectColumn,
        { key: "id", name: "ID", width: 60 },
        { key: "name", name: "Name", width: 150 },
        { key: "email", name: "Email", width: 200 },
        { key: "department", name: "Department", width: 120 },
        {
          key: "isActive",
          name: "Status",
          width: 100,
          renderCell: ({ row }) => (row.isActive ? "✅ Active" : "⏸️ Inactive"),
        },
        {
          key: "selectable",
          name: "Selectable",
          width: 100,
          renderCell: ({ row }) => (row.isActive ? "✅ Yes" : "❌ No"),
        },
      ],
      [],
    );

    // Only allow selection of active users
    const isRowSelectionDisabled = (row: Person) => !row.isActive;

    return (
      <div style={{ height: "500px", width: "100%" }}>
        <DataGrid
          columns={columns}
          rows={rows}
          selectedRows={selectedRows}
          onSelectedRowsChange={setSelectedRows}
          rowKeyGetter={(row) => row.id}
          isRowSelectionDisabled={isRowSelectionDisabled}
        />
      </div>
    );
  },
};

export const SelectionWithKeyboardNavigation: Story = {
  render: () => {
    const [rows] = useState(() => generatePeople(25));
    const [selectedRows, setSelectedRows] = useState<ReadonlySet<number>>(
      new Set([1, 3, 5]),
    );

    const columns: Column<Person>[] = useMemo(
      () => [
        SelectColumn,
        { key: "id", name: "ID", width: 60 },
        { key: "name", name: "Name", width: 150 },
        { key: "email", name: "Email", width: 200 },
        { key: "department", name: "Department", width: 120 },
        { key: "role", name: "Role", width: 120 },
      ],
      [],
    );

    return (
      <div style={{ height: "500px", width: "100%" }}>
        <DataGrid
          columns={columns}
          rows={rows}
          selectedRows={selectedRows}
          onSelectedRowsChange={setSelectedRows}
          rowKeyGetter={(row) => row.id}
        />
      </div>
    );
  },
};
