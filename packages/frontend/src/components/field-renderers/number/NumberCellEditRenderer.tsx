import { useRef } from "react";
import { TextInput } from "../../form-controls/controls/TextInput/TextInput";
import type {
  CellEditLifecycle,
  CellEditRenderer,
  CellEditRendererResult,
} from "../types";

/**
 * Cell edit renderer for number values.
 * Provides an inline number input for editing numbers in table cells.
 */
export const NumberCellEditRenderer: CellEditRenderer = ({
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
  // px-2 = 8px to match cell's padding-inline
  const element = (
    <TextInput
      ref={inputRef}
      type="number"
      value={value ?? ""}
      onChange={(e) => {
        const num = e.target.value === "" ? null : Number(e.target.value);
        onChange(num);
      }}
      placeholder={metadata?.description}
      hasError={hasError}
      className="w-full text-sm h-full py-0 px-2 border-0 shadow-none rounded-none focus-visible:ring-0"
    />
  );

  return { element, lifecycle, autoCommit: false };
};
