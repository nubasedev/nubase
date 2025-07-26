import type { Meta, StoryObj } from "@storybook/react";
import { useCallback, useState } from "react";
import { useResize } from "../dock/useResize";
import { VerticalResizeHandle } from "./VerticalResizeHandle";

const meta: Meta<typeof VerticalResizeHandle> = {
  title: "Resize/VerticalResizeHandle",
  component: VerticalResizeHandle,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const VerticalResizeBottomAligned: Story = {
  render: () => {
    const [size, setSize] = useState(200);
    const getConstraints = useCallback(() => ({ min: 100, max: 400 }), []);
    const handleResize = useResize(
      setSize,
      () => size,
      getConstraints,
      false,
      true,
    );

    return (
      <div className="flex flex-col w-full">
        <div
          className="relative bg-primary/10 border border-border flex items-center justify-center w-full"
          style={{ height: size }}
        >
          <span className="text-foreground">Resizable Panel</span>
          <VerticalResizeHandle onMouseDown={handleResize} align="bottom" />
        </div>
        <div className="h-32 bg-secondary/10 border border-border flex items-center justify-center w-full">
          <span className="text-foreground text-center">Fixed Panel</span>
        </div>
      </div>
    );
  },
};

export const VerticalResizeTopAligned: Story = {
  render: () => {
    const [size, setSize] = useState(200);
    const getConstraints = useCallback(() => ({ min: 100, max: 400 }), []);
    const handleResize = useResize(
      setSize,
      () => size,
      getConstraints,
      true, // reverse direction for top-aligned handle
      true,
    );

    return (
      <div className="flex flex-col w-full">
        <div className="h-32 bg-secondary/10 border border-border flex items-center justify-center w-full">
          <span className="text-foreground text-center">Fixed Panel</span>
        </div>
        <div
          className="relative bg-primary/10 border border-border flex items-center justify-center w-full"
          style={{ height: size }}
        >
          <span className="text-foreground">Resizable Panel</span>
          <VerticalResizeHandle onMouseDown={handleResize} align="top" />
        </div>
      </div>
    );
  },
};
