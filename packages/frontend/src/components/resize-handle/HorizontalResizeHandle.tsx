import type React from "react";
import { useState } from "react";
import { cn } from "../../styling/cn";

interface HorizontalResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
  align: "left" | "right";
}

// Constants for handle dimensions and positioning
const HANDLE_WIDTH = "w-1.5"; // 8px width

/**
 * A resize handle that resizes hozintonally (even though the handle itself is vertical)
 */
export const HorizontalResizeHandle: React.FC<HorizontalResizeHandleProps> = ({
  onMouseDown,
  align,
}) => {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <button
      data-component="ResizeHandle"
      type="button"
      tabIndex={0}
      className={cn(
        // Base positioning and layout
        "absolute top-0 bottom-0 z-10",
        HANDLE_WIDTH,
        "cursor-col-resize",

        // Alignment based on prop
        align === "left" ? "left-0" : "right-0",

        // Animation and styling
        "transition-all duration-200",
        isHovering ? "bg-border" : "bg-transparent",
        "hover:bg-border",
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseDown={onMouseDown}
    />
  );
};
