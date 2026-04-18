import {
  DialogBackdrop,
  DialogPanel,
  Dialog as HeadlessDialog,
} from "@headlessui/react";
import type { FC, ReactElement } from "react";
import { cloneElement, useCallback, useState } from "react";
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
  const showBackdrop = depth === 0;
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

  return (
    <HeadlessDialog
      open={open}
      onClose={onClose}
      className="relative"
      style={{ zIndex: zIndex + depth }}
    >
      {showBackdrop && (
        <DialogBackdrop className="fixed inset-0 bg-black/50 transition-opacity duration-300 ease-out data-[closed]:opacity-0" />
      )}

      <div className="fixed inset-0 flex justify-end pointer-events-none">
        <DialogPanel
          style={{ width }}
          className="pointer-events-auto relative h-full bg-background text-foreground shadow-2xl border-l border-border transition-transform duration-300 ease-out data-[closed]:translate-x-full"
        >
          <HorizontalResizeHandle onMouseDown={handleResize} align="left" />
          {cloneElement(content, { onClose })}
        </DialogPanel>
      </div>
    </HeadlessDialog>
  );
};
