import type { Meta, StoryObj } from "@storybook/react";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import {
  MoreHorizontalIcon,
  SettingsIcon,
  TrashIcon,
  UserIcon,
} from "lucide-react";
import { useState } from "react";
import { Button } from "../buttons/Button/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu/DropdownMenu";
import { EnhancedPagination } from "./Pagination";
import {
  EnhancedTable,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./Table";

const meta: Meta<typeof EnhancedTable> = {
  title: "Table/Table",
  component: EnhancedTable,
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
        active:
          "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
        inactive:
          "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
        pending:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
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
    size: 80,
    cell: ({ row }) => {
      const user = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => console.log("View user", user.id)}>
              <UserIcon className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log("Edit user", user.id)}>
              <SettingsIcon className="mr-2 h-4 w-4" />
              Edit User
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => console.log("Delete user", user.id)}
            >
              <TrashIcon className="mr-2 h-4 w-4" />
              Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
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
          ? "text-green-600 dark:text-green-400"
          : stock > 20
            ? "text-yellow-600 dark:text-yellow-400"
            : "text-red-600 dark:text-red-400";
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
          <span className="text-yellow-500">★</span>
        </div>
      );
    },
  },
];

// Basic Shadcn-style table story
export const ShadcnTable: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="w-[80px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sampleUsers.slice(0, 3).map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontalIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <UserIcon className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    Edit User
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive">
                    <TrashIcon className="mr-2 h-4 w-4" />
                    Delete User
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "A basic table using Shadcn-style components with manual data rendering.",
      },
    },
  },
};

export const BasicEnhancedTable: Story = {
  args: {
    data: sampleUsers,
    columns: userColumns,
    loading: false,
    enableSorting: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "An enhanced table with TanStack Table integration, sorting, and data management.",
      },
    },
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

export const ProductTable: Story = {
  args: {
    data: sampleProducts,
    columns: productColumns,
    loading: false,
    enableSorting: true,
  },
  parameters: {
    docs: {
      description: {
        story: "A table displaying product data with custom cell renderers.",
      },
    },
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
        <EnhancedTable
          {...args}
          sorting={sorting}
          onSortingChange={setSorting}
        />
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

        <EnhancedTable
          data={paginatedData}
          columns={userColumns}
          loading={false}
          enableSorting={true}
          sorting={sorting}
          onSortingChange={setSorting}
        />

        <EnhancedPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={allUsers.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newPageSize) => {
            setPageSize(newPageSize);
            setCurrentPage(1);
          }}
          showPageSizeSelector={true}
          showInfo={true}
        />
      </div>
    );
  },
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          "A complete data table with pagination, sorting, and page size selection.",
      },
    },
  },
};

// Loading state simulation
export const LoadingSimulation: Story = {
  render: (args) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(sampleUsers);

    const simulateLoading = () => {
      setLoading(true);
      setTimeout(() => {
        setData([...sampleUsers].reverse());
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

        <EnhancedTable {...args} data={data} loading={loading} />
      </div>
    );
  },
  args: {
    columns: userColumns,
    enableSorting: true,
    loadingMessage: "Refreshing data...",
  },
};
