import { useDefaultRenderers } from "../DataGridDefaultRenderersContext";
import type { RenderCheckboxProps } from "../types";

type SharedInputProps = Pick<
  RenderCheckboxProps,
  | "disabled"
  | "tabIndex"
  | "aria-label"
  | "aria-labelledby"
  | "indeterminate"
  | "onChange"
>;

interface SelectCellFormatterProps extends SharedInputProps {
  value: boolean;
}

export function SelectCellFormatter({
  value,
  tabIndex,
  indeterminate,
  disabled,
  onChange,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: SelectCellFormatterProps) {
  const defaultRenderers = useDefaultRenderers();
  if (!defaultRenderers?.renderCheckbox) {
    throw new Error("DataGrid default renderCheckbox renderer is missing.");
  }
  const { renderCheckbox } = defaultRenderers;

  return renderCheckbox({
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    tabIndex,
    indeterminate,
    disabled,
    checked: value,
    onChange,
  });
}
