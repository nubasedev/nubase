import type { FC, ReactElement } from "react";
import { cloneElement, useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useResize } from "../../dock/useResize";
import { HorizontalResizeHandle } from "../../resize-handle/HorizontalResizeHandle";
import type { BaseModalFrameProps } from "../modal/types";

export type DrawerProps = {
  open: boolean;
  onClose: () => void;
  content: ReactElement<BaseModalFrameProps>;
  depth?: number;
  zIndex?: number;
};

const INITIAL_WIDTH_FRACTIONS = [0.6, 0.55, 0.5, 0.45] as const;
const MIN_WIDTH_PX = 400;
const VIEWPORT_RESERVED_PX = 100;
const SSR_FALLBACK_WIDTH = 600;

function getInitialWidthPx(depth: number): number {
  const fraction =
    INITIAL_WIDTH_FRACTIONS[
      Math.min(depth, INITIAL_WIDTH_FRACTIONS.length - 1)
    ] ?? 0.4;
  if (typeof window === "undefined") return SSR_FALLBACK_WIDTH;
  return Math.round(window.innerWidth * fraction);
}

export const Drawer: FC<DrawerProps> = ({
  open,
  onClose,
  content,
  depth = 0,
  zIndex = 50,
}) => {
  const [width, setWidth] = useState(() => getInitialWidthPx(depth));

  const getConstraints = useCallback(
    () => ({
      min: MIN_WIDTH_PX,
      max:
        typeof window === "undefined"
          ? Number.POSITIVE_INFINITY
          : window.innerWidth - VIEWPORT_RESERVED_PX,
    }),
    [],
  );

  const handleResize = useResize(setWidth, () => width, getConstraints, true);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0"
      style={{ zIndex: zIndex + depth, pointerEvents: "none" }}
    >
      <div
        role="dialog"
        aria-modal="false"
        className="absolute right-0 top-0 h-full bg-background text-foreground shadow-2xl border-l border-border"
        style={{ width, pointerEvents: "auto" }}
      >
        <HorizontalResizeHandle onMouseDown={handleResize} align="left" />
        {cloneElement(content, { onClose })}
      </div>
    </div>,
    document.body,
  );
};
