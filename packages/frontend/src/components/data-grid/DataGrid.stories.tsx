import type { Meta, StoryObj } from "@storybook/react";
import { useMemo, useState } from "react";
import { DataGrid } from "./DataGrid";
import type { Column, SortColumn } from "./types";

const meta: Meta<typeof DataGrid> = {
  title: "Data Grid/DataGrid",
  component: DataGrid,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
A powerful and flexible data grid component with features like sorting, editing, row selection, 
column resizing, and more. Built on the react-data-grid library with Nubase styling.

**Key Features:**
- Virtualized rendering for performance
- Column sorting, resizing, and reordering
- Row selection and editing
- Custom cell renderers
- Frozen columns
- Summary rows
- Keyboard navigation
        `,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    columns: {
      description: "Array of column definitions",
      control: false,
    },
    rows: {
      description: "Array of data rows",
      control: false,
    },
    rowHeight: {
      description: "Height of each row in pixels",
      control: "number",
      defaultValue: 35,
    },
    headerRowHeight: {
      description: "Height of header row in pixels",
      control: "number",
      defaultValue: 35,
    },
    selectedRows: {
      description: "Set of selected row keys",
      control: false,
    },
    onRowsChange: {
      description: "Callback when rows are modified",
      action: "rowsChanged",
    },
    onSelectedRowsChange: {
      description: "Callback when row selection changes",
      action: "selectionChanged",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample data interfaces
interface Person {
  id: number;
  name: string;
  email: string;
  age: number;
  city: string;
  country: string;
  isActive: boolean;
  salary: number;
  joinDate: string;
}

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  inStock: boolean;
  description: string;
  rating: number;
}

// Sample data generators
const generatePeople = (count: number): Person[] => {
  const cities = [
    "New York",
    "London",
    "Tokyo",
    "Paris",
    "Sydney",
    "Toronto",
    "Berlin",
    "Mumbai",
  ];
  const countries = [
    "USA",
    "UK",
    "Japan",
    "France",
    "Australia",
    "Canada",
    "Germany",
    "India",
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
    email: `person${i + 1}@example.com`,
    age: 20 + (i % 50),
    city: cities[i % cities.length] ?? `City ${i + 1}`,
    country: countries[i % countries.length] ?? `Country ${i + 1}`,
    isActive: Math.random() > 0.3,
    salary: 30000 + Math.floor(Math.random() * 80000),
    joinDate:
      new Date(
        2020 + Math.floor(Math.random() * 4),
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1,
      )
        .toISOString()
        .split("T")[0] ?? "2024-01-01",
  }));
};

const generateProducts = (count: number): Product[] => {
  const categories = [
    "Electronics",
    "Clothing",
    "Books",
    "Home",
    "Sports",
    "Beauty",
  ];
  const productNames = [
    "Widget",
    "Gadget",
    "Tool",
    "Device",
    "Item",
    "Product",
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `${productNames[i % productNames.length]} ${i + 1}`,
    category: categories[i % categories.length] ?? "Category",
    price: 10 + Math.floor(Math.random() * 500),
    inStock: Math.random() > 0.2,
    description: `Description for product ${i + 1}`,
    rating: 1 + Math.floor(Math.random() * 5),
  }));
};

// Basic DataGrid story
export const Basic: Story = {
  render: () => {
    const rows = useMemo(() => generatePeople(50), []);

    const columns: Column<Person>[] = useMemo(
      () => [
        { key: "id", name: "ID", width: 60 },
        { key: "name", name: "Name", width: 150 },
        { key: "email", name: "Email", width: 200 },
        { key: "age", name: "Age", width: 80 },
        { key: "city", name: "City", width: 120 },
        { key: "country", name: "Country", width: 120 },
      ],
      [],
    );

    return (
      <div style={{ height: "500px", width: "100%" }}>
        <DataGrid columns={columns} rows={rows} />
      </div>
    );
  },
};

// DataGrid with sorting
export const WithSorting: Story = {
  render: () => {
    const [rows, _setRows] = useState(() => generatePeople(100));
    const [sortColumns, setSortColumns] = useState<readonly SortColumn[]>([]);

    const columns: Column<Person>[] = useMemo(
      () => [
        { key: "id", name: "ID", width: 60, sortable: true },
        { key: "name", name: "Name", width: 150, sortable: true },
        { key: "email", name: "Email", width: 200, sortable: true },
        { key: "age", name: "Age", width: 80, sortable: true },
        { key: "city", name: "City", width: 120, sortable: true },
        {
          key: "salary",
          name: "Salary",
          width: 120,
          sortable: true,
          renderCell: ({ row }) => `$${row.salary.toLocaleString()}`,
        },
      ],
      [],
    );

    const sortedRows = useMemo(() => {
      if (sortColumns.length === 0) return rows;

      return [...rows].sort((a, b) => {
        for (const sort of sortColumns) {
          const { columnKey, direction } = sort;
          const aValue = a[columnKey as keyof Person];
          const bValue = b[columnKey as keyof Person];

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
      <div style={{ height: "500px", width: "100%" }}>
        <DataGrid
          columns={columns}
          rows={sortedRows}
          sortColumns={sortColumns}
          onSortColumnsChange={setSortColumns}
        />
      </div>
    );
  },
};

// DataGrid with resizable columns
export const WithResizableColumns: Story = {
  render: () => {
    const rows = useMemo(() => generateProducts(75), []);

    const columns: Column<Product>[] = useMemo(
      () => [
        { key: "id", name: "ID", width: 60, resizable: true },
        { key: "name", name: "Product Name", width: 200, resizable: true },
        { key: "category", name: "Category", width: 120, resizable: true },
        {
          key: "price",
          name: "Price",
          width: 100,
          resizable: true,
          renderCell: ({ row }) => `$${row.price}`,
        },
        {
          key: "rating",
          name: "Rating",
          width: 100,
          resizable: true,
          renderCell: ({ row }) =>
            "★".repeat(row.rating) + "☆".repeat(5 - row.rating),
        },
        {
          key: "inStock",
          name: "In Stock",
          width: 100,
          resizable: true,
          renderCell: ({ row }) => (row.inStock ? "✅ Yes" : "❌ No"),
        },
        {
          key: "description",
          name: "Description",
          width: 300,
          resizable: true,
        },
      ],
      [],
    );

    return (
      <div style={{ height: "500px", width: "100%" }}>
        <DataGrid columns={columns} rows={rows} />
      </div>
    );
  },
};

// Large dataset for performance testing
export const LargeDataset: Story = {
  render: () => {
    const rows = useMemo(() => generatePeople(10000), []);

    const columns: Column<Person>[] = useMemo(
      () => [
        { key: "id", name: "ID", width: 80, frozen: true },
        { key: "name", name: "Name", width: 150, frozen: true },
        { key: "email", name: "Email", width: 200 },
        { key: "age", name: "Age", width: 80 },
        { key: "city", name: "City", width: 120 },
        { key: "country", name: "Country", width: 120 },
        {
          key: "salary",
          name: "Salary",
          width: 120,
          renderCell: ({ row }) => `$${row.salary.toLocaleString()}`,
        },
        { key: "joinDate", name: "Join Date", width: 120 },
        {
          key: "isActive",
          name: "Active",
          width: 80,
          renderCell: ({ row }) => (row.isActive ? "✅" : "❌"),
        },
      ],
      [],
    );

    return (
      <div style={{ height: "600px", width: "100%" }}>
        <DataGrid columns={columns} rows={rows} />
      </div>
    );
  },
};

// Minimal example for documentation
export const Minimal: Story = {
  render: () => {
    const rows = [
      { id: 1, name: "Alice", age: 30 },
      { id: 2, name: "Bob", age: 25 },
      { id: 3, name: "Carol", age: 35 },
    ];

    const columns: Column<(typeof rows)[0]>[] = [
      { key: "id", name: "ID", width: 60 },
      { key: "name", name: "Name", width: 150 },
      { key: "age", name: "Age", width: 80 },
    ];

    return (
      <div style={{ height: "200px", width: "400px" }}>
        <DataGrid columns={columns} rows={rows} />
      </div>
    );
  },
};

// Empty state
export const EmptyState: Story = {
  render: () => {
    const rows: Person[] = [];
    const columns: Column<Person>[] = [
      { key: "id", name: "ID", width: 60 },
      { key: "name", name: "Name", width: 150 },
      { key: "email", name: "Email", width: 200 },
    ];

    return (
      <div style={{ height: "300px", width: "100%" }}>
        <DataGrid columns={columns} rows={rows} />
      </div>
    );
  },
};
