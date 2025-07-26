import type { Meta, StoryObj } from "@storybook/react";
import { useMemo, useState } from "react";
import { ActivityIndicator } from "../activity-indicator/ActivityIndicator";
import { Button } from "../buttons/Button/Button";
import { DataGrid } from "./DataGrid";
import type { Column } from "./types";

const meta: Meta<typeof DataGrid> = {
  title: "Data Grid/Custom Renderers",
  component: DataGrid,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
DataGrid with custom cell renderers demonstrating various ways to display and interact with data.
Includes buttons, badges, progress bars, images, and other custom components.
        `,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

interface Employee {
  id: number;
  name: string;
  avatar: string;
  email: string;
  department: string;
  status: "active" | "inactive" | "pending";
  progress: number;
  skills: string[];
  joinDate: string;
  salary: number;
  rating: number;
  isManager: boolean;
}

interface Product {
  id: number;
  name: string;
  image: string;
  category: string;
  price: number;
  discount: number;
  inStock: boolean;
  stockLevel: number;
  tags: string[];
  reviews: { count: number; average: number };
  trending: boolean;
}

const generateEmployees = (count: number): Employee[] => {
  const departments = ["Engineering", "Sales", "Marketing", "HR", "Finance"];
  const statuses: Employee["status"][] = ["active", "inactive", "pending"];
  const skills = [
    "JavaScript",
    "Python",
    "React",
    "Node.js",
    "SQL",
    "AWS",
    "Docker",
    "Kubernetes",
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
    name: names[i % names.length] ?? `Employee ${i + 1}`,
    avatar: `https://i.pravatar.cc/40?img=${i + 1}`,
    email: `employee${i + 1}@company.com`,
    department: departments[i % departments.length] ?? "Department",
    status: statuses[i % statuses.length] ?? "pending",
    progress: Math.floor(Math.random() * 100),
    skills: skills.slice(0, 2 + Math.floor(Math.random() * 3)),
    joinDate:
      new Date(
        2020 + Math.floor(Math.random() * 4),
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1,
      )
        .toISOString()
        .split("T")[0] ?? "2024-01-01",
    salary: 50000 + Math.floor(Math.random() * 100000),
    rating: 1 + Math.floor(Math.random() * 5),
    isManager: Math.random() > 0.8,
  }));
};

const generateProducts = (count: number): Product[] => {
  const categories = ["Electronics", "Clothing", "Books", "Home", "Sports"];
  const tags = ["New", "Popular", "Sale", "Featured", "Limited"];

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Product ${i + 1}`,
    image: `https://picsum.photos/60/60?random=${i + 1}`,
    category: categories[i % categories.length] ?? "Category",
    price: 10 + Math.floor(Math.random() * 500),
    discount: Math.floor(Math.random() * 30),
    inStock: Math.random() > 0.2,
    stockLevel: Math.floor(Math.random() * 100),
    tags: tags.slice(0, 1 + Math.floor(Math.random() * 3)),
    reviews: {
      count: Math.floor(Math.random() * 1000),
      average: 1 + Math.random() * 4,
    },
    trending: Math.random() > 0.7,
  }));
};

// Status Badge Component
const StatusBadge = ({ status }: { status: Employee["status"] }) => {
  const colors = {
    active: "bg-green-100 text-green-800 border-green-200",
    inactive: "bg-gray-100 text-gray-800 border-gray-200",
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${colors[status]}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Progress Bar Component
const ProgressBar = ({ value, max = 100 }: { value: number; max?: number }) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
      <div className="text-xs mt-1 text-center">{value}%</div>
    </div>
  );
};

// Avatar Component
const Avatar = ({ src, name }: { src: string; name: string }) => (
  <div className="flex items-center space-x-2">
    <img
      src={src}
      alt={name}
      className="w-8 h-8 rounded-full object-cover"
      onError={(e) => {
        // Fallback to initials if image fails to load
        const target = e.target as HTMLImageElement;
        target.style.display = "none";
      }}
    />
    <span className="font-medium">{name}</span>
  </div>
);

// Skills Tags Component
const SkillsTags = ({ skills }: { skills: string[] }) => (
  <div className="flex flex-wrap gap-1">
    {skills.map((skill, index) => (
      <span
        key={index}
        className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800"
      >
        {skill}
      </span>
    ))}
  </div>
);

// Rating Stars Component
const RatingStars = ({ rating, max = 5 }: { rating: number; max?: number }) => (
  <div className="flex items-center">
    {Array.from({ length: max }, (_, i) => (
      <span
        key={i}
        className={`text-sm ${i < rating ? "text-yellow-400" : "text-gray-300"}`}
      >
        ★
      </span>
    ))}
    <span className="ml-1 text-xs text-gray-600">({rating})</span>
  </div>
);

export const EmployeeDirectory: Story = {
  render: () => {
    const [rows, _setRows] = useState(() => generateEmployees(20));
    const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>(
      {},
    );

    const handleAction = (employeeId: number, action: string) => {
      setLoadingStates((prev) => ({ ...prev, [employeeId]: true }));

      // Simulate async action
      setTimeout(() => {
        setLoadingStates((prev) => ({ ...prev, [employeeId]: false }));
        console.log(`${action} for employee ${employeeId}`);
      }, 1500);
    };

    const columns: Column<Employee>[] = useMemo(
      () => [
        {
          key: "id",
          name: "ID",
          width: 60,
          renderCell: ({ row }) => (
            <span className="font-mono text-gray-600">#{row.id}</span>
          ),
        },
        {
          key: "employee",
          name: "Employee",
          width: 200,
          renderCell: ({ row }) => <Avatar src={row.avatar} name={row.name} />,
        },
        { key: "email", name: "Email", width: 180 },
        { key: "department", name: "Department", width: 120 },
        {
          key: "status",
          name: "Status",
          width: 100,
          renderCell: ({ row }) => <StatusBadge status={row.status} />,
        },
        {
          key: "progress",
          name: "Progress",
          width: 120,
          renderCell: ({ row }) => <ProgressBar value={row.progress} />,
        },
        {
          key: "skills",
          name: "Skills",
          width: 200,
          renderCell: ({ row }) => <SkillsTags skills={row.skills} />,
        },
        {
          key: "rating",
          name: "Rating",
          width: 120,
          renderCell: ({ row }) => <RatingStars rating={row.rating} />,
        },
        {
          key: "manager",
          name: "Role",
          width: 80,
          renderCell: ({ row }) =>
            row.isManager ? (
              <span className="text-purple-600 font-semibold">👑 Mgr</span>
            ) : (
              <span className="text-gray-500">Staff</span>
            ),
        },
        {
          key: "actions",
          name: "Actions",
          width: 140,
          renderCell: ({ row }) => (
            <div className="flex space-x-1">
              <Button
                variant="secondary"
                onClick={() => handleAction(row.id, "view")}
                disabled={loadingStates[row.id]}
                className="text-xs px-2 py-1"
              >
                {loadingStates[row.id] ? (
                  <ActivityIndicator size="xs" />
                ) : (
                  "View"
                )}
              </Button>
              <Button
                variant="default"
                onClick={() => handleAction(row.id, "edit")}
                disabled={loadingStates[row.id]}
                className="text-xs px-2 py-1"
              >
                Edit
              </Button>
            </div>
          ),
        },
      ],
      [loadingStates],
    );

    return (
      <div style={{ height: "600px", width: "100%" }}>
        <DataGrid columns={columns} rows={rows} />
      </div>
    );
  },
};

export const ProductCatalog: Story = {
  render: () => {
    const [rows] = useState(() => generateProducts(15));

    const columns: Column<Product>[] = useMemo(
      () => [
        { key: "id", name: "ID", width: 60 },
        {
          key: "product",
          name: "Product",
          width: 250,
          renderCell: ({ row }) => (
            <div className="flex items-center space-x-3">
              <img
                src={row.image}
                alt={row.name}
                className="w-12 h-12 rounded object-cover"
              />
              <div>
                <div className="font-medium">{row.name}</div>
                <div className="text-sm text-gray-500">{row.category}</div>
              </div>
            </div>
          ),
        },
        {
          key: "price",
          name: "Price",
          width: 120,
          renderCell: ({ row }) => (
            <div>
              {row.discount > 0 ? (
                <div>
                  <span className="line-through text-gray-400 text-sm">
                    ${row.price}
                  </span>
                  <span className="ml-2 font-bold text-green-600">
                    ${Math.round(row.price * (1 - row.discount / 100))}
                  </span>
                  <div className="text-xs text-red-500">-{row.discount}%</div>
                </div>
              ) : (
                <span className="font-bold">${row.price}</span>
              )}
            </div>
          ),
        },
        {
          key: "stock",
          name: "Stock",
          width: 120,
          renderCell: ({ row }) => (
            <div>
              <div
                className={`text-sm font-medium ${row.inStock ? "text-green-600" : "text-red-600"}`}
              >
                {row.inStock ? "✅ In Stock" : "❌ Out of Stock"}
              </div>
              {row.inStock && (
                <div className="text-xs text-gray-500">
                  {row.stockLevel} units
                </div>
              )}
            </div>
          ),
        },
        {
          key: "reviews",
          name: "Reviews",
          width: 140,
          renderCell: ({ row }) => (
            <div>
              <RatingStars rating={Math.round(row.reviews.average)} />
              <div className="text-xs text-gray-500">
                {row.reviews.count} reviews
              </div>
            </div>
          ),
        },
        {
          key: "tags",
          name: "Tags",
          width: 150,
          renderCell: ({ row }) => (
            <div className="flex flex-wrap gap-1">
              {row.trending && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-red-100 text-red-800">
                  🔥 Trending
                </span>
              )}
              {row.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded text-xs bg-indigo-100 text-indigo-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          ),
        },
        {
          key: "actions",
          name: "Actions",
          width: 100,
          renderCell: ({ row }) => (
            <Button
              variant={row.inStock ? "default" : "secondary"}
              onClick={() => console.log(`Add to cart: ${row.name}`)}
              disabled={!row.inStock}
              className="text-xs px-3 py-1 h-7"
            >
              {row.inStock ? "Add to Cart" : "Notify Me"}
            </Button>
          ),
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

export const DashboardMetrics: Story = {
  render: () => {
    const [_refreshing, setRefreshing] = useState(false);

    const metrics = [
      {
        id: 1,
        name: "Total Sales",
        value: 125000,
        change: 12.5,
        target: 150000,
        status: "good",
      },
      {
        id: 2,
        name: "Active Users",
        value: 8432,
        change: -2.1,
        target: 10000,
        status: "warning",
      },
      {
        id: 3,
        name: "Conversion Rate",
        value: 3.2,
        change: 5.8,
        target: 4.0,
        status: "good",
      },
      {
        id: 4,
        name: "Server Uptime",
        value: 99.9,
        change: 0.1,
        target: 99.5,
        status: "excellent",
      },
      {
        id: 5,
        name: "Support Tickets",
        value: 23,
        change: -15.2,
        target: 20,
        status: "warning",
      },
    ];

    const columns: Column<(typeof metrics)[0]>[] = useMemo(
      () => [
        {
          key: "name",
          name: "Metric",
          width: 180,
          renderCell: ({ row }) => (
            <div className="font-medium">{row.name}</div>
          ),
        },
        {
          key: "value",
          name: "Current Value",
          width: 150,
          renderCell: ({ row }) => (
            <div className="text-lg font-bold">
              {row.name === "Total Sales"
                ? `$${row.value.toLocaleString()}`
                : row.name === "Conversion Rate" || row.name === "Server Uptime"
                  ? `${row.value}%`
                  : row.value.toLocaleString()}
            </div>
          ),
        },
        {
          key: "change",
          name: "Change",
          width: 120,
          renderCell: ({ row }) => (
            <div
              className={`flex items-center ${row.change >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              <span className="mr-1">{row.change >= 0 ? "↗️" : "↘️"}</span>
              <span className="font-medium">{Math.abs(row.change)}%</span>
            </div>
          ),
        },
        {
          key: "progress",
          name: "Progress to Target",
          width: 200,
          renderCell: ({ row }) => {
            const progress = Math.min((row.value / row.target) * 100, 100);
            const isGood = progress >= 80;

            return (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Target: {row.target}</span>
                  <span>{progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${isGood ? "bg-green-500" : "bg-yellow-500"}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          },
        },
        {
          key: "status",
          name: "Status",
          width: 120,
          renderCell: ({ row }) => {
            const colors = {
              excellent: "bg-green-100 text-green-800 border-green-200",
              good: "bg-blue-100 text-blue-800 border-blue-200",
              warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
              poor: "bg-red-100 text-red-800 border-red-200",
            };

            const icons = {
              excellent: "🚀",
              good: "✅",
              warning: "⚠️",
              poor: "❌",
            };

            return (
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${colors[row.status as keyof typeof colors]}`}
              >
                <span className="mr-1">
                  {icons[row.status as keyof typeof icons]}
                </span>
                {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
              </span>
            );
          },
        },
      ],
      [],
    );

    const _handleRefresh = () => {
      setRefreshing(true);
      setTimeout(() => setRefreshing(false), 2000);
    };

    return (
      <div style={{ height: "400px", width: "100%" }}>
        <DataGrid columns={columns} rows={metrics} />
      </div>
    );
  },
};
