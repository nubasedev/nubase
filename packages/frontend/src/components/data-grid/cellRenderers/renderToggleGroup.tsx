import { groupCellCaretClassname, groupCellContentClassname } from "../styles";
import type { RenderGroupCellProps } from "../types";

const caretClassname = groupCellCaretClassname;

export function renderToggleGroup<R, SR>(props: RenderGroupCellProps<R, SR>) {
  return <ToggleGroup {...props} />;
}

export function ToggleGroup<R, SR>({
  groupKey,
  isExpanded,
  tabIndex,
  toggleGroup,
}: RenderGroupCellProps<R, SR>) {
  function handleKeyDown({ key }: React.KeyboardEvent<HTMLSpanElement>) {
    if (key === "Enter") {
      toggleGroup();
    }
  }

  const d = isExpanded ? "M1 1 L 7 7 L 13 1" : "M1 7 L 7 1 L 13 7";

  return (
    <span
      className={groupCellContentClassname}
      tabIndex={tabIndex}
      onKeyDown={handleKeyDown}
    >
      {groupKey as string}
      <svg
        viewBox="0 0 14 8"
        width="14"
        height="8"
        className={caretClassname}
        aria-hidden
      >
        <path d={d} />
      </svg>
    </span>
  );
}
