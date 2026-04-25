import type { FC, ReactElement, ReactNode } from "react";
import { cloneElement, useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePresence } from "../../../hooks/usePresence";
import { useResize } from "../../dock/useResize";
import { HorizontalResizeHandle } from "../../resize-handle/HorizontalResizeHandle";
import type { BaseModalFrameProps } from "../modal/types";

export type DrawerProps = {
  open: boolean;
  onClose: () => void;
  content: ReactElement<BaseModalFrameProps>;
  /** Optional content rendered at the top of the drawer (e.g. a command bar). */
  header?: ReactNode;
  /** Fires after the exit animation completes and the drawer unmounts its surface. */
  onExited?: () => void;
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
  onExited,
  zIndex = 50,
}) => {
  const [width, setWidth] = useState(
    () => readPersistedWidth() ?? getDefaultWidthPx(),
  );
  const { shouldRender, presenceProps } = usePresence(open, { onExited });

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

  if (!shouldRender) return null;
  if (typeof document === "undefined") return null;

  const animationClasses =
    "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right data-[state=open]:fade-in data-[state=closed]:fade-out duration-200";

  return createPortal(
    <div
      role="dialog"
      aria-modal="false"
      {...presenceProps}
      className={`fixed right-0 top-0 h-full bg-popover text-popover-foreground shadow-[-12px_0_32px_-8px_rgba(0,0,0,0.18)] border-l border-border flex flex-col min-h-0 ${animationClasses}`}
      style={{ width, zIndex, animationFillMode: "forwards" }}
    >
      <HorizontalResizeHandle onMouseDown={handleResize} align="left" />
      {header && <div className="flex-shrink-0">{header}</div>}
      <div className="flex-1 min-h-0 overflow-hidden">
        {cloneElement(content, { onClose })}
      </div>
    </div>,
    document.body,
  );
};
