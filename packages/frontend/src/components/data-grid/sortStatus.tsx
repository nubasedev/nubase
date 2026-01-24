import { ChevronDown, ChevronUp } from "lucide-react";
import { sortArrowClassname } from "./styles";
import type {
  RenderSortIconProps,
  RenderSortPriorityProps,
  RenderSortStatusProps,
} from "./types";

export default function renderSortStatus({
  sortDirection,
  priority,
}: RenderSortStatusProps) {
  return (
    <>
      {renderSortIcon({ sortDirection })}
      {renderSortPriority({ priority })}
    </>
  );
}

export function renderSortIcon({ sortDirection }: RenderSortIconProps) {
  if (sortDirection === undefined) return null;

  const Icon = sortDirection === "ASC" ? ChevronUp : ChevronDown;

  return <Icon size={14} className={sortArrowClassname} aria-hidden="true" />;
}

export function renderSortPriority({ priority }: RenderSortPriorityProps) {
  return priority;
}
