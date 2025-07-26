import { Checkbox } from "../../form-controls";
import type { RenderCheckboxProps } from "../types";

export function renderCheckbox({
  onChange,
  indeterminate,
  ...props
}: RenderCheckboxProps) {
  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    const checked = !props.checked;
    onChange(checked, event.shiftKey);
  }

  return (
    <div className="flex items-center justify-center">
      <Checkbox
        data-indeterminate={indeterminate}
        className={
          indeterminate
            ? "data-[indeterminate=true]:bg-primary data-[indeterminate=true]:border-primary"
            : ""
        }
        onClick={handleClick}
        {...props}
      />
    </div>
  );
}
