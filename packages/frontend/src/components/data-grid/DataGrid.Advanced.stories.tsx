import type { Meta, StoryObj } from "@storybook/react";
import { useMemo, useState } from "react";
import { DataGrid } from "./DataGrid";
import type { Column } from "./types";

const meta: Meta<typeof DataGrid> = {
  title: "Data Grid/Advanced Features",
  component: DataGrid,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
Advanced DataGrid features including grouped columns, frozen columns, 
summary rows, and complex data visualization.
        `,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

interface SalesData {
  id: number;
  rep: string;
  region: string;
  product: string;
  q1Sales: number;
  q1Target: number;
  q2Sales: number;
  q2Target: number;
  q3Sales: number;
  q3Target: number;
  q4Sales: number;
  q4Target: number;
  ytdSales: number;
  ytdTarget: number;
}

const generateSalesData = (count: number): SalesData[] => {
  const reps = [
    "Alice Johnson",
    "Bob Smith",
    "Carol Brown",
    "David Wilson",
    "Eva Garcia",
  ];
  const regions = ["North", "South", "East", "West", "Central"];
  const products = ["Product A", "Product B", "Product C", "Product D"];

  return Array.from({ length: count }, (_, i) => {
    const baseTarget = 100000 + Math.random() * 50000;
    return {
      id: i + 1,
      rep: reps[i % reps.length] ?? "Rep",
      region: regions[i % regions.length] ?? "Region",
      product: products[i % products.length] ?? "Product",
      q1Sales: Math.floor(baseTarget * 0.2 + Math.random() * baseTarget * 0.1),
      q1Target: Math.floor(baseTarget * 0.25),
      q2Sales: Math.floor(baseTarget * 0.23 + Math.random() * baseTarget * 0.1),
      q2Target: Math.floor(baseTarget * 0.25),
      q3Sales: Math.floor(baseTarget * 0.22 + Math.random() * baseTarget * 0.1),
      q3Target: Math.floor(baseTarget * 0.25),
      q4Sales: Math.floor(baseTarget * 0.28 + Math.random() * baseTarget * 0.1),
      q4Target: Math.floor(baseTarget * 0.25),
      ytdSales: 0,
      ytdTarget: Math.floor(baseTarget),
    };
  }).map((row) => ({
    ...row,
    ytdSales: row.q1Sales + row.q2Sales + row.q3Sales + row.q4Sales,
  }));
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(value);

export const BasicAdvanced: Story = {
  render: () => {
    const [rows] = useState(() => generateSalesData(20));

    const columns: Column<SalesData>[] = useMemo(
      () => [
        { key: "id", name: "ID", width: 60, frozen: true },
        { key: "rep", name: "Sales Rep", width: 150, frozen: true },
        { key: "region", name: "Region", width: 100 },
        { key: "product", name: "Product", width: 120 },
        {
          key: "q1Sales",
          name: "Q1 Sales",
          width: 120,
          renderCell: ({ row }) => formatCurrency(row.q1Sales),
        },
        {
          key: "q2Sales",
          name: "Q2 Sales",
          width: 120,
          renderCell: ({ row }) => formatCurrency(row.q2Sales),
        },
        {
          key: "ytdSales",
          name: "YTD Sales",
          width: 140,
          renderCell: ({ row }) => formatCurrency(row.ytdSales),
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
