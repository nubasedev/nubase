import type { Meta, StoryObj } from "@storybook/react";
import { Pagination } from "./Pagination";

const meta: Meta<typeof Pagination> = {
  title: "Table/Pagination",
  component: Pagination,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    currentPage: {
      control: { type: "number", min: 1 },
    },
    totalPages: {
      control: { type: "number", min: 1 },
    },
    pageSize: {
      control: { type: "number", min: 1 },
    },
    totalItems: {
      control: { type: "number", min: 0 },
    },
    showPageSizeSelector: {
      control: { type: "boolean" },
    },
    showInfo: {
      control: { type: "boolean" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    currentPage: 1,
    totalPages: 10,
    pageSize: 10,
    totalItems: 95,
    showPageSizeSelector: true,
    showInfo: true,
    onPageChange: () => {},
    onPageSizeChange: () => {},
  },
};

export const WithoutPageSizeSelector: Story = {
  args: {
    currentPage: 2,
    totalPages: 15,
    pageSize: 20,
    totalItems: 289,
    showPageSizeSelector: false,
    showInfo: true,
    onPageChange: () => {},
    onPageSizeChange: () => {},
  },
};

export const WithoutInfo: Story = {
  args: {
    currentPage: 4,
    totalPages: 12,
    pageSize: 10,
    totalItems: 115,
    showPageSizeSelector: true,
    showInfo: false,
    onPageChange: () => {},
    onPageSizeChange: () => {},
  },
};

export const Minimal: Story = {
  args: {
    currentPage: 1,
    totalPages: 5,
    pageSize: 10,
    totalItems: 42,
    showPageSizeSelector: false,
    showInfo: false,
    onPageChange: () => {},
    onPageSizeChange: () => {},
  },
};

export const SinglePage: Story = {
  args: {
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalItems: 5,
    showPageSizeSelector: true,
    showInfo: true,
    onPageChange: () => {},
    onPageSizeChange: () => {},
  },
};

export const ManyPages: Story = {
  args: {
    currentPage: 25,
    totalPages: 50,
    pageSize: 20,
    totalItems: 1000,
    showPageSizeSelector: true,
    showInfo: true,
    onPageChange: () => {},
    onPageSizeChange: () => {},
  },
};

export const LastPage: Story = {
  args: {
    currentPage: 7,
    totalPages: 7,
    pageSize: 15,
    totalItems: 93,
    showPageSizeSelector: true,
    showInfo: true,
    onPageChange: () => {},
    onPageSizeChange: () => {},
  },
};

export const CustomPageSizeOptions: Story = {
  args: {
    currentPage: 2,
    totalPages: 20,
    pageSize: 5,
    totalItems: 95,
    showPageSizeSelector: true,
    showInfo: true,
    onPageChange: () => {},
    onPageSizeChange: () => {},
    pageSizeOptions: [5, 15, 30, 100],
  },
};
