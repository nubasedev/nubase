import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  EnhancedPagination,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./Pagination";

const meta: Meta<typeof EnhancedPagination> = {
  title: "Table/Pagination",
  component: EnhancedPagination,
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

// Basic Shadcn-style pagination story
export const ShadcnPagination: Story = {
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">2</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">10</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "A basic pagination using Shadcn-style components with manual control.",
      },
    },
  },
};

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
  parameters: {
    docs: {
      description: {
        story:
          "An enhanced pagination with all features enabled including page size selection and info display.",
      },
    },
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
  },
  parameters: {
    docs: {
      description: {
        story: "Pagination without the page size selector dropdown.",
      },
    },
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
  parameters: {
    docs: {
      description: {
        story: "Pagination without the info text showing current range.",
      },
    },
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
  },
  parameters: {
    docs: {
      description: {
        story: "Minimal pagination showing only the page controls.",
      },
    },
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
  parameters: {
    docs: {
      description: {
        story:
          "Pagination with only one page (navigation controls are hidden).",
      },
    },
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
  parameters: {
    docs: {
      description: {
        story:
          "Pagination with many pages showing ellipsis for truncated page numbers.",
      },
    },
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
  parameters: {
    docs: {
      description: {
        story: "Pagination on the last page (next button is disabled).",
      },
    },
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
  parameters: {
    docs: {
      description: {
        story: "Pagination with custom page size options.",
      },
    },
  },
};

// Interactive story to demonstrate functionality
export const Interactive: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const totalItems = 247;
    const totalPages = Math.ceil(totalItems / pageSize);

    return (
      <div className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <h3 className="font-semibold text-foreground mb-2">Current State:</h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              Page: {currentPage} of {totalPages}
            </p>
            <p>Page Size: {pageSize}</p>
            <p>Total Items: {totalItems}</p>
            <p>
              Showing: {Math.min((currentPage - 1) * pageSize + 1, totalItems)}-
              {Math.min(currentPage * pageSize, totalItems)}
            </p>
          </div>
        </div>

        <EnhancedPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={(page) => {
            setCurrentPage(page);
            console.log("Page changed to:", page);
          }}
          onPageSizeChange={(newPageSize) => {
            setPageSize(newPageSize);
            setCurrentPage(1); // Reset to first page
            console.log("Page size changed to:", newPageSize);
          }}
          showPageSizeSelector={true}
          showInfo={true}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Interactive pagination that responds to page changes and updates the display accordingly.",
      },
    },
  },
};

// Large dataset example
export const LargeDataset: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = useState(50);
    const [pageSize, setPageSize] = useState(25);
    const totalItems = 10000;
    const totalPages = Math.ceil(totalItems / pageSize);

    return (
      <div className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <h3 className="font-semibold text-foreground mb-2">
            Large Dataset Example
          </h3>
          <p className="text-sm text-muted-foreground">
            This demonstrates pagination with a large number of pages, showing
            how ellipsis are used to truncate the page numbers.
          </p>
        </div>

        <EnhancedPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newPageSize) => {
            setPageSize(newPageSize);
            setCurrentPage(1);
          }}
          showPageSizeSelector={true}
          showInfo={true}
          pageSizeOptions={[10, 25, 50, 100]}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Pagination with a large dataset showing intelligent page number truncation.",
      },
    },
  },
};

// Edge cases
export const EdgeCases: Story = {
  render: () => {
    const [scenario, setScenario] = useState<"empty" | "single" | "few">(
      "empty",
    );

    const scenarios = {
      empty: { currentPage: 1, totalPages: 0, pageSize: 10, totalItems: 0 },
      single: { currentPage: 1, totalPages: 1, pageSize: 10, totalItems: 3 },
      few: { currentPage: 2, totalPages: 3, pageSize: 10, totalItems: 25 },
    };

    const currentScenario = scenarios[scenario];

    return (
      <div className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <h3 className="font-semibold text-foreground mb-2">Edge Cases</h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setScenario("empty")}
              className={`px-3 py-1 text-sm rounded ${
                scenario === "empty"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              Empty Dataset
            </button>
            <button
              type="button"
              onClick={() => setScenario("single")}
              className={`px-3 py-1 text-sm rounded ${
                scenario === "single"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              Single Page
            </button>
            <button
              type="button"
              onClick={() => setScenario("few")}
              className={`px-3 py-1 text-sm rounded ${
                scenario === "few"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              Few Pages
            </button>
          </div>
        </div>

        <EnhancedPagination
          {...currentScenario}
          onPageChange={() => {}}
          onPageSizeChange={() => {}}
          showPageSizeSelector={true}
          showInfo={true}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Various edge cases including empty datasets and single page scenarios.",
      },
    },
  },
};
