import type { Meta, StoryObj } from "@storybook/react";
import { useCallback, useState } from "react";
import { useResize } from "../dock/useResize";
import { HorizontalResizeHandle } from "./HorizontalResizeHandle";

const meta: Meta<typeof HorizontalResizeHandle> = {
  title: "Resize/HorizontalResizeHandle",
  component: HorizontalResizeHandle,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const HorizontalResizeRightAligned: Story = {
  render: () => {
    const [size, setSize] = useState(200);
    const getConstraints = useCallback(() => ({ min: 100, max: 400 }), []);
    const handleResize = useResize(
      setSize,
      () => size,
      getConstraints,
      false,
      false,
    );

    return (
      <div className="flex">
        <div
          className="relative bg-primary/10 border border-border flex items-center justify-center"
          style={{ width: size, height: 300 }}
        >
          <span className="text-foreground">Resizable Panel</span>
          <HorizontalResizeHandle onMouseDown={handleResize} align="right" />
        </div>
        <div className="w-32 bg-secondary/10 border border-border flex items-center justify-center">
          <span className="text-foreground text-center">Fixed Panel</span>
        </div>
      </div>
    );
  },
};

export const HorizontalResizeLeftAligned: Story = {
  render: () => {
    const [size, setSize] = useState(200);
    const getConstraints = useCallback(() => ({ min: 100, max: 400 }), []);
    const handleResize = useResize(
      setSize,
      () => size,
      getConstraints,
      true, // reverse direction for left-aligned handle
      false,
    );

    return (
      <div className="flex">
        <div className="w-32 bg-secondary/10 border border-border flex items-center justify-center">
          <span className="text-foreground text-center">Fixed Panel</span>
        </div>
        <div
          className="relative bg-primary/10 border border-border flex items-center justify-center"
          style={{ width: size, height: 300 }}
        >
          <span className="text-foreground">Resizable Panel</span>
          <HorizontalResizeHandle onMouseDown={handleResize} align="left" />
        </div>
      </div>
    );
  },
};
