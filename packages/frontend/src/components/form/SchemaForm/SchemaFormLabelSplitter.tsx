import { useRef } from "react";
import {
  MAX_LABEL_WIDTH,
  MIN_LABEL_WIDTH,
  useSchemaFormLayout,
} from "./SchemaFormLayoutContext";

export const SchemaFormLabelSplitter = () => {
  const { labelWidth, setLabelWidth } = useSchemaFormLayout();
  const dragStateRef = useRef<{
    pointerId: number;
    startX: number;
    startWidth: number;
  } | null>(null);
  const prevUserSelectRef = useRef<string>("");
  const prevCursorRef = useRef<string>("");

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStateRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startWidth: labelWidth,
    };
    prevUserSelectRef.current = document.body.style.userSelect;
    prevCursorRef.current = document.body.style.cursor;
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== e.pointerId) return;
    const delta = e.clientX - dragState.startX;
    setLabelWidth(dragState.startWidth + delta);
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== e.pointerId) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    dragStateRef.current = null;
    document.body.style.userSelect = prevUserSelectRef.current;
    document.body.style.cursor = prevCursorRef.current;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 20 : 10;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setLabelWidth(labelWidth - step);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setLabelWidth(labelWidth + step);
    } else if (e.key === "Home") {
      e.preventDefault();
      setLabelWidth(MIN_LABEL_WIDTH);
    } else if (e.key === "End") {
      e.preventDefault();
      setLabelWidth(MAX_LABEL_WIDTH);
    }
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: resizable splitter needs children and drag handlers, which <hr> doesn't support
    <div
      role="separator"
      tabIndex={0}
      aria-orientation="vertical"
      aria-label="Resize label column"
      aria-valuenow={labelWidth}
      aria-valuemin={MIN_LABEL_WIDTH}
      aria-valuemax={MAX_LABEL_WIDTH}
      className="group absolute top-0 bottom-0 z-10 hidden cursor-col-resize touch-none select-none outline-none focus-visible:ring-2 focus-visible:ring-ring sm:block"
      style={{
        left: "calc(var(--schema-form-label-width, 8rem) + 0.5rem - 4px)",
        width: "8px",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={handleKeyDown}
    >
      <div className="mx-auto h-full w-px bg-border transition-colors group-hover:bg-ring" />
    </div>
  );
};
