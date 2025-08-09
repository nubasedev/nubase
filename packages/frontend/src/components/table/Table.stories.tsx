import type { Meta, StoryObj } from "@storybook/react";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { useState } from "react";
import { Button } from "../buttons/Button/Button";
import { Pagination } from "./Pagination";
import { Table } from "./Table";

const meta: Meta<typeof Table> = {
  title: "Table/Table",
  component: Table,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    loading: {
      control: { type: "boolean" },
    },
    enableSorting: {
      control: { type: "boolean" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample data types
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive" | "pending";
  createdAt: string;
  lastLogin?: string;
}

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  rating: number;
}

// Sample data
const sampleUsers: User[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Admin",
    status: "active",
    createdAt: "2024-01-15",
    lastLogin: "2024-01-20",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "User",
    status: "active",
    createdAt: "2024-01-10",
    lastLogin: "2024-01-19",
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob.johnson@example.com",
    role: "Moderator",
    status: "inactive",
    createdAt: "2024-01-05",
    lastLogin: "2024-01-18",
  },
  {
    id: 4,
    name: "Alice Brown",
    email: "alice.brown@example.com",
    role: "User",
    status: "pending",
    createdAt: "2024-01-20",
  },
  {
    id: 5,
    name: "Charlie Wilson",
    email: "charlie.wilson@example.com",
    role: "User",
    status: "active",
    createdAt: "2024-01-12",
    lastLogin: "2024-01-21",
  },
];

const sampleProducts: Product[] = [
  {
    id: 1,
    name: "Laptop Pro",
    category: "Electronics",
    price: 1299.99,
    stock: 45,
    rating: 4.5,
  },
  {
    id: 2,
    name: "Wireless Mouse",
    category: "Electronics",
    price: 29.99,
    stock: 120,
    rating: 4.2,
  },
  {
    id: 3,
    name: "Desk Chair",
    category: "Furniture",
    price: 199.99,
    stock: 30,
    rating: 4.0,
  },
  {
    id: 4,
    name: "Monitor Stand",
    category: "Accessories",
    price: 49.99,
    stock: 75,
    rating: 3.8,
  },
  {
    id: 5,
    name: "Keyboard",
    category: "Electronics",
    price: 89.99,
    stock: 60,
    rating: 4.3,
  },
];

// Column definitions
const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
    size: 200,
  },
  {
    accessorKey: "email",
    header: "Email",
    size: 250,
  },
  {
    accessorKey: "role",
    header: "Role",
    size: 120,
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 120,
    cell: ({ getValue }) => {
      const status = getValue() as User["status"];
      const statusClasses = {
        active: "bg-secondary text-secondary-foreground",
        inactive: "bg-destructive/10 text-destructive-foreground",
        pending: "bg-accent text-accent-foreground",
      };
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status]}`}
        >
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    size: 120,
  },
  {
    accessorKey: "lastLogin",
    header: "Last Login",
    size: 120,
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value || <span className="text-muted-foreground">Never</span>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    size: 120,
    cell: () => (
      <div className="flex gap-1">
        <Button variant="secondary">Edit</Button>
        <Button variant="destructive">Delete</Button>
      </div>
    ),
  },
];

const productColumns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: "Product Name",
    size: 200,
  },
  {
    accessorKey: "category",
    header: "Category",
    size: 150,
  },
  {
    accessorKey: "price",
    header: "Price",
    size: 120,
    cell: ({ getValue }) => `$${(getValue() as number).toFixed(2)}`,
  },
  {
    accessorKey: "stock",
    header: "Stock",
    size: 100,
    cell: ({ getValue }) => {
      const stock = getValue() as number;
      const color =
        stock > 50
          ? "text-primaryContainer"
          : stock > 20
            ? "text-tertiaryContainer"
            : "text-errorContainer";
      return <span className={color}>{stock}</span>;
    },
  },
  {
    accessorKey: "rating",
    header: "Rating",
    size: 120,
    cell: ({ getValue }) => {
      const rating = getValue() as number;
      return (
        <div className="flex items-center gap-1">
          <span>{rating}</span>
          <span className="text-tertiaryContainer">★</span>
        </div>
      );
    },
  },
];

export const BasicTable: Story = {
  args: {
    data: sampleUsers,
    columns: userColumns,
    loading: false,
    enableSorting: true,
  },
};

export const LoadingTable: Story = {
  args: {
    data: sampleUsers,
    columns: userColumns,
    loading: true,
    enableSorting: true,
    loadingMessage: "Loading users...",
  },
};

export const EmptyTable: Story = {
  args: {
    data: [],
    columns: userColumns,
    loading: false,
    enableSorting: true,
    emptyMessage: "No users found",
  },
};

export const NoSorting: Story = {
  args: {
    data: sampleUsers,
    columns: userColumns,
    loading: false,
    enableSorting: false,
  },
};

export const CustomLoadingMessage: Story = {
  args: {
    data: sampleProducts,
    columns: productColumns,
    loading: true,
    loadingMessage: "Fetching product data...",
    enableSorting: true,
  },
};

export const CustomEmptyMessage: Story = {
  args: {
    data: [],
    columns: productColumns,
    loading: false,
    enableSorting: true,
    emptyMessage: "🛍️ No products available at the moment",
  },
};

// Interactive story with sorting
export const InteractiveSorting: Story = {
  render: (args) => {
    const [sorting, setSorting] = useState<SortingState>([]);

    return (
      <div className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <h3 className="font-semibold text-foreground mb-2">
            Current Sorting:
          </h3>
          <pre className="text-sm text-muted-foreground">
            {sorting.length > 0
              ? JSON.stringify(sorting, null, 2)
              : "No sorting applied"}
          </pre>
        </div>
        <Table {...args} sorting={sorting} onSortingChange={setSorting} />
      </div>
    );
  },
  args: {
    data: sampleUsers,
    columns: userColumns,
    loading: false,
    enableSorting: true,
  },
};

// Complete example with pagination
export const WithPagination: Story = {
  render: (_args) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(3);
    const [sorting, setSorting] = useState<SortingState>([]);

    // Generate more data for pagination demo
    const allUsers = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      role: ["Admin", "User", "Moderator"][i % 3],
      status: (["active", "inactive", "pending"] as const)[i % 3],
      createdAt: new Date(2024, 0, i + 1).toISOString().split("T")[0],
      lastLogin:
        i % 4 === 0
          ? undefined
          : new Date(2024, 0, i + 10).toISOString().split("T")[0],
    }));

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = allUsers.slice(startIndex, endIndex);
    const totalPages = Math.ceil(allUsers.length / pageSize);

    return (
      <div className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <h3 className="font-semibold text-foreground mb-2">
            Demo with {allUsers.length} total users
          </h3>
          <p className="text-sm text-muted-foreground">
            Showing page {currentPage} of {totalPages} (items {startIndex + 1}-
            {Math.min(endIndex, allUsers.length)})
          </p>
          {sorting.length > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              Sorting by:{" "}
              {sorting
                .map((s) => `${s.id} ${s.desc ? "desc" : "asc"}`)
                .join(", ")}
            </p>
          )}
        </div>

        <Table
          data={paginatedData}
          columns={userColumns}
          loading={false}
          enableSorting={true}
          sorting={sorting}
          onSortingChange={setSorting}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={allUsers.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newPageSize) => {
            setPageSize(newPageSize);
            setCurrentPage(1); // Reset to first page when changing page size
          }}
          showPageSizeSelector={true}
          showInfo={true}
        />
      </div>
    );
  },
  args: {},
};

// Loading state simulation
export const LoadingSimulation: Story = {
  render: (args) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(sampleUsers);

    const simulateLoading = () => {
      setLoading(true);
      setTimeout(() => {
        setData([...sampleUsers].reverse()); // Simulate data change
        setLoading(false);
      }, 2000);
    };

    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={simulateLoading} disabled={loading}>
            {loading ? "Loading..." : "Simulate API Call"}
          </Button>
        </div>

        <Table {...args} data={data} loading={loading} />
      </div>
    );
  },
  args: {
    columns: userColumns,
    enableSorting: true,
    loadingMessage: "Refreshing data...",
  },
};
