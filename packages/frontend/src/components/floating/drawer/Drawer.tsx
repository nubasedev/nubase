import type { FC, ReactElement, ReactNode } from "react";
import { cloneElement, useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useResize } from "../../dock/useResize";
import { HorizontalResizeHandle } from "../../resize-handle/HorizontalResizeHandle";
import type { BaseModalFrameProps } from "../modal/types";

export type DrawerProps = {
  open: boolean;
  onClose: () => void;
  content: ReactElement<BaseModalFrameProps>;
  /** Optional content rendered at the top of the drawer (e.g. a command bar). */
  header?: ReactNode;
  zIndex?: number;
};

const WIDTH_STORAGE_KEY = "nubase:drawer-width";
const DEFAULT_WIDTH_FRACTION = 0.6;
const MIN_WIDTH_PX = 400;
const VIEWPORT_RESERVED_PX = 100;
const SSR_FALLBACK_WIDTH = 600;

function getDefaultWidthPx(): number {
  if (typeof window === "undefined") return SSR_FALLBACK_WIDTH;
  return Math.round(window.innerWidth * DEFAULT_WIDTH_FRACTION);
}

function readPersistedWidth(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(WIDTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed < MIN_WIDTH_PX) return null;
    return parsed;
  } catch {
    return null;
  }
}

function persistWidth(width: number): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(WIDTH_STORAGE_KEY, String(width));
  } catch {
    /* ignore quota / privacy errors */
  }
}

export const Drawer: FC<DrawerProps> = ({
  open,
  onClose,
  content,
  header,
  zIndex = 50,
}) => {
  const [width, setWidth] = useState(
    () => readPersistedWidth() ?? getDefaultWidthPx(),
  );

  useEffect(() => {
    persistWidth(width);
  }, [width]);

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
    <div className="fixed inset-0" style={{ zIndex, pointerEvents: "none" }}>
      <div
        role="dialog"
        aria-modal="false"
        className="absolute right-0 top-0 h-full bg-background text-foreground shadow-2xl border-l border-border flex flex-col min-h-0"
        style={{ width, pointerEvents: "auto" }}
      >
        <HorizontalResizeHandle onMouseDown={handleResize} align="left" />
        {header && <div className="flex-shrink-0">{header}</div>}
        <div className="flex-1 min-h-0 overflow-hidden">
          {cloneElement(content, { onClose })}
        </div>
      </div>
    </div>,
    document.body,
  );
};
