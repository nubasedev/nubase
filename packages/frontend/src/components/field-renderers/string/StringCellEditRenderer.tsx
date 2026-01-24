import { useRef } from "react";
import { TextInput } from "../../form-controls/controls/TextInput/TextInput";
import type {
  CellEditLifecycle,
  CellEditRenderer,
  CellEditRendererResult,
} from "../types";

/**
 * Cell edit renderer for string values.
 * Provides an inline text input for editing strings in table cells.
 */
export const StringCellEditRenderer: CellEditRenderer = ({
  value,
  onChange,
  hasError,
  metadata,
}): CellEditRendererResult => {
  const inputRef = useRef<HTMLInputElement>(null);

  const lifecycle: CellEditLifecycle = {
    onEnterEdit: () => {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 0);
    },
  };

  // Style to match grid cell: no border/shadow, full height
  // Grid cell has: padding-inline: 8px, padding-block: 0, align-content: center
  // px-2 = 8px to match cell's padding-inline
  const element = (
    <TextInput
      ref={inputRef}
      type="text"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={metadata?.description}
      hasError={hasError}
      className="w-full text-sm h-full py-0 px-2 border-0 shadow-none rounded-none focus-visible:ring-0"
    />
  );

  return { element, lifecycle, autoCommit: false };
};
