import type { Meta, StoryObj } from "@storybook/react";
import { useCallback, useState } from "react";
import { ResizeHandle } from "./ResizeHandle";
import { useResize } from "./useResize";

const meta: Meta<typeof ResizeHandle> = {
  title: "Dock/ResizeHandle",
  component: ResizeHandle,
};

export default meta;
type Story = StoryObj<typeof meta>;

const ResizeDemo = ({
  direction,
}: {
  direction: "horizontal" | "vertical";
}) => {
  const [size, setSize] = useState(200);

  const getConstraints = useCallback(() => ({ min: 100, max: 400 }), []);

  const handleResize = useResize(
    setSize,
    () => size,
    getConstraints,
    false,
    direction === "horizontal",
  );

  return (
    <div className="p-8 bg-background">
      <div className="mb-4 text-sm text-muted-foreground">
        Current size: {size}px (drag the handle to resize)
      </div>

      {direction === "vertical" ? (
        <div className="flex">
          <div
            className="bg-primary/10 border border-border flex items-center justify-center"
            style={{ width: size, height: 300 }}
          >
            <span className="text-foreground">Resizable Panel</span>
          </div>
          <div className="relative">
            <ResizeHandle direction="vertical" onMouseDown={handleResize} />
          </div>
          <div className="w-32 bg-secondary/10 border border-border flex items-center justify-center">
            <span className="text-foreground text-center">Fixed Panel</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col">
          <div
            className="bg-primary/10 border border-border flex items-center justify-center"
            style={{ height: size }}
          >
            <span className="text-foreground">Resizable Panel</span>
          </div>
          <div className="relative">
            <ResizeHandle direction="horizontal" onMouseDown={handleResize} />
          </div>
          <div className="h-32 bg-secondary/10 border border-border flex items-center justify-center">
            <span className="text-foreground text-center">Fixed Panel</span>
          </div>
        </div>
      )}
    </div>
  );
};

export const VerticalResize: Story = {
  render: () => <ResizeDemo direction="vertical" />,
  args: {
    direction: "vertical",
  },
};

export const HorizontalResize: Story = {
  render: () => <ResizeDemo direction="horizontal" />,
  args: {
    direction: "horizontal",
  },
};
