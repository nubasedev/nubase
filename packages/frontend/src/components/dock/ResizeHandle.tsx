import type React from "react";
import { useState } from "react";

// Constants for resize handle sizing
const INTERACTION_AREA_SIZE = 2; // px on each side

interface ResizeHandleProps {
  direction: "horizontal" | "vertical";
  onMouseDown: (e: React.MouseEvent) => void;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  direction,
  onMouseDown,
}) => {
  const [isHovering, setIsHovering] = useState(false);

  const interactionAreaClasses = `absolute ${
    direction === "vertical"
      ? `top-0 bottom-0 -left-[${INTERACTION_AREA_SIZE}px] -right-[${INTERACTION_AREA_SIZE}px]`
      : `left-0 right-0 -top-[${INTERACTION_AREA_SIZE}px] -bottom-[${INTERACTION_AREA_SIZE}px]`
  }`;

  return (
    <div
      className={interactionAreaClasses}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseDown={onMouseDown}
    >
      <div
        className={`absolute z-10 transition-all duration-200 ${
          direction === "vertical"
            ? `cursor-col-resize top-0 bottom-0 left-1/2 -translate-x-1/2 ${isHovering ? "bg-primary/30 w-2" : "bg-outline/20 w-1"}`
            : `cursor-row-resize left-0 right-0 top-1/2 -translate-y-1/2 ${isHovering ? "bg-primary/30 h-2" : "bg-outline/20 h-1"}`
        }`}
      />
    </div>
  );
};
