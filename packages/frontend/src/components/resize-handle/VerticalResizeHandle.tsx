import type React from "react";
import { useState } from "react";
import { cn } from "../../styling/cn";

interface VerticalResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
  align: "top" | "bottom";
}

// Constants for handle dimensions and positioning
const HANDLE_HEIGHT = "h-1.5"; // 8px height

/**
 * A resize handle that resizes vertically (even though the handle itself is horizontal)
 */
export const VerticalResizeHandle: React.FC<VerticalResizeHandleProps> = ({
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
        "absolute left-0 right-0 z-10",
        HANDLE_HEIGHT,
        "cursor-row-resize",

        // Alignment based on prop
        align === "top" ? "top-0" : "bottom-0",

        // Animation and styling
        "transition-all duration-200",
        // Debug: always show a slight background to verify positioning
        isHovering ? "bg-border" : "bg-border/10",
        "hover:bg-border",
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseDown={onMouseDown}
    />
  );
};
