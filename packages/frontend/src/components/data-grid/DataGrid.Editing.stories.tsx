import type { Meta, StoryObj } from "@storybook/react";
import { useMemo, useState } from "react";
import { showToast } from "../floating/toast";
import { DataGrid } from "./DataGrid";
import textEditor from "./editors/textEditor";
import type { Column } from "./types";

const meta: Meta<typeof DataGrid> = {
  title: "Data Grid/Editing",
  component: DataGrid,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
DataGrid with inline editing capabilities. Demonstrates text editing, custom editors,
validation, and different editing behaviors.
        `,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

interface EditableProduct {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  isActive: boolean;
  rating: number;
  tags: string;
}

interface EditablePerson {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  department: string;
  salary: number;
  notes: string;
}

const generateProducts = (count: number): EditableProduct[] => {
  const categories = ["Electronics", "Clothing", "Books", "Home", "Sports"];
  const productNames = ["Widget", "Gadget", "Tool", "Device", "Item"];

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `${productNames[i % productNames.length]} ${i + 1}`,
    category: categories[i % categories.length] ?? "Category",
    price: 10 + Math.floor(Math.random() * 500),
    description: `High-quality product with excellent features ${i + 1}`,
    isActive: Math.random() > 0.3,
    rating: 1 + Math.floor(Math.random() * 5),
    tags:
      ["new", "popular", "featured"][Math.floor(Math.random() * 3)] ?? "tag",
  }));
};

const generatePeople = (count: number): EditablePerson[] => {
  const firstNames = [
    "Alice",
    "Bob",
    "Carol",
    "David",
    "Eva",
    "Frank",
    "Grace",
    "Henry",
  ];
  const lastNames = [
    "Johnson",
    "Smith",
    "Brown",
    "Wilson",
    "Garcia",
    "Miller",
    "Lee",
    "Davis",
  ];
  const departments = ["Engineering", "Sales", "Marketing", "HR", "Finance"];

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    firstName: firstNames[i % firstNames.length] ?? "First",
    lastName: lastNames[i % lastNames.length] ?? "Last",
    email: `person${i + 1}@company.com`,
    age: 22 + (i % 40),
    department: departments[i % departments.length] ?? "Department",
    salary: 50000 + Math.floor(Math.random() * 100000),
    notes: `Notes for person ${i + 1}`,
  }));
};

// Custom number editor component
const NumberEditor = ({ row, column, onRowChange }: any) => {
  const value = row[column.key as keyof typeof row] as number;

  return (
    <input
      className="w-full h-full px-2 border-0 outline-0 bg-transparent"
      type="number"
      value={value}
      onChange={(e) => {
        const newValue = e.target.value === "" ? 0 : Number(e.target.value);
        onRowChange({ ...row, [column.key]: newValue });
      }}
      onBlur={(e) => {
        // Validate on blur
        const newValue = Number(e.target.value);
        if (column.key === "price" && newValue < 0) {
          showToast("Price cannot be negative", "error");
          onRowChange({ ...row, [column.key]: 0 });
        } else if (column.key === "age" && (newValue < 0 || newValue > 120)) {
          showToast("Age must be between 0 and 120", "error");
          onRowChange({
            ...row,
            [column.key]: Math.min(120, Math.max(0, newValue)),
          });
        }
      }}
      style={{ font: "inherit" }}
    />
  );
};

// Custom select editor
const SelectEditor = ({ row, column, onRowChange, options }: any) => {
  const value = row[column.key as keyof typeof row] as string;

  return (
    <select
      className="w-full h-full px-1 border-0 outline-0 bg-transparent"
      value={value}
      onChange={(e) => {
        onRowChange({ ...row, [column.key]: e.target.value });
      }}
      style={{ font: "inherit" }}
    >
      {options.map((option: string) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};

export const BasicEditing: Story = {
  render: () => {
    const [rows, setRows] = useState(() => generateProducts(15));

    const columns: Column<EditableProduct>[] = useMemo(
      () => [
        { key: "id", name: "ID", width: 60 },
        {
          key: "name",
          name: "Product Name",
          width: 200,
          renderEditCell: textEditor,
        },
        {
          key: "category",
          name: "Category",
          width: 120,
          renderEditCell: (props) => (
            <SelectEditor
              {...props}
              options={["Electronics", "Clothing", "Books", "Home", "Sports"]}
            />
          ),
        },
        {
          key: "price",
          name: "Price",
          width: 100,
          renderCell: ({ row }) => `$${row.price}`,
          renderEditCell: NumberEditor,
        },
        {
          key: "description",
          name: "Description",
          width: 300,
          renderEditCell: textEditor,
        },
        {
          key: "rating",
          name: "Rating",
          width: 100,
          renderCell: ({ row }) =>
            "★".repeat(row.rating) + "☆".repeat(5 - row.rating),
          renderEditCell: (props) => (
            <SelectEditor {...props} options={["1", "2", "3", "4", "5"]} />
          ),
        },
      ],
      [],
    );

    const handleRowsChange = (newRows: EditableProduct[]) => {
      setRows(newRows);
      showToast("Changes saved!", "default");
    };

    return (
      <div style={{ height: "500px", width: "100%" }}>
        <DataGrid
          columns={columns}
          rows={rows}
          onRowsChange={handleRowsChange}
        />
      </div>
    );
  },
};

export const ConditionalEditing: Story = {
  render: () => {
    const [rows, setRows] = useState(() => generatePeople(12));

    const columns: Column<EditablePerson>[] = useMemo(
      () => [
        { key: "id", name: "ID", width: 60 },
        {
          key: "firstName",
          name: "First Name",
          width: 120,
          renderEditCell: textEditor,
        },
        {
          key: "lastName",
          name: "Last Name",
          width: 120,
          renderEditCell: textEditor,
        },
        {
          key: "email",
          name: "Email",
          width: 200,
          renderEditCell: textEditor,
        },
        {
          key: "age",
          name: "Age",
          width: 80,
          renderEditCell: NumberEditor,
          // Only allow editing for people under 65
          editable: (row) => row.age < 65,
        },
        {
          key: "department",
          name: "Department",
          width: 120,
          renderEditCell: (props) => (
            <SelectEditor
              {...props}
              options={["Engineering", "Sales", "Marketing", "HR", "Finance"]}
            />
          ),
        },
        {
          key: "salary",
          name: "Salary",
          width: 120,
          renderCell: ({ row }) => `$${row.salary.toLocaleString()}`,
          renderEditCell: NumberEditor,
          // Only HR and managers can edit salary
          editable: (row) => row.department === "HR",
        },
        {
          key: "notes",
          name: "Notes",
          width: 200,
          renderEditCell: textEditor,
        },
      ],
      [],
    );

    const handleRowsChange = (newRows: EditablePerson[]) => {
      setRows(newRows);
      showToast("Employee data updated!", "default");
    };

    return (
      <div style={{ height: "500px", width: "100%" }}>
        <DataGrid
          columns={columns}
          rows={rows}
          onRowsChange={handleRowsChange}
        />
      </div>
    );
  },
};

export const EditingWithValidation: Story = {
  render: () => {
    const [rows, setRows] = useState(() => generateProducts(10));
    const [errors, setErrors] = useState<Record<string, string>>({});

    const columns: Column<EditableProduct>[] = useMemo(
      () => [
        { key: "id", name: "ID", width: 60 },
        {
          key: "name",
          name: "Product Name",
          width: 200,
          renderEditCell: textEditor,
          cellClass: (row) =>
            errors[`${row.id}-name`] ? "border-red-500 bg-red-50" : "",
        },
        {
          key: "price",
          name: "Price",
          width: 100,
          renderCell: ({ row }) => `$${row.price}`,
          renderEditCell: NumberEditor,
          cellClass: (row) =>
            errors[`${row.id}-price`] ? "border-red-500 bg-red-50" : "",
        },
        {
          key: "description",
          name: "Description",
          width: 300,
          renderEditCell: textEditor,
          cellClass: (row) =>
            errors[`${row.id}-description`] ? "border-red-500 bg-red-50" : "",
        },
      ],
      [errors],
    );

    const validateRow = (row: EditableProduct): Record<string, string> => {
      const rowErrors: Record<string, string> = {};

      if (!row.name || row.name.trim().length < 3) {
        rowErrors[`${row.id}-name`] =
          "Product name must be at least 3 characters";
      }

      if (row.price <= 0) {
        rowErrors[`${row.id}-price`] = "Price must be greater than 0";
      }

      if (!row.description || row.description.trim().length < 10) {
        rowErrors[`${row.id}-description`] =
          "Description must be at least 10 characters";
      }

      return rowErrors;
    };

    const handleRowsChange = (newRows: EditableProduct[]) => {
      // Validate all rows
      const allErrors: Record<string, string> = {};
      newRows.forEach((row) => {
        const rowErrors = validateRow(row);
        Object.assign(allErrors, rowErrors);
      });

      setErrors(allErrors);
      setRows(newRows);

      if (Object.keys(allErrors).length === 0) {
        showToast("All changes are valid and saved!", "default");
      } else {
        showToast("Some fields have validation errors", "error");
      }
    };

    return (
      <div style={{ height: "500px", width: "100%" }}>
        <DataGrid
          columns={columns}
          rows={rows}
          onRowsChange={handleRowsChange}
        />
      </div>
    );
  },
};
