import type { NavItem } from "../../../config/nav-item";

// Helper function to flatten items for search
export const flattenNavItems = (
  items: NavItem[],
  level = 0,
): (NavItem & { level: number })[] => {
  return items.reduce(
    (acc, item) => {
      acc.push({ ...item, level });
      if (item.children) {
        acc.push(...flattenNavItems(item.children, level + 1));
      }
      return acc;
    },
    [] as (NavItem & { level: number })[],
  );
};

// Helper function to filter items based on search query
export const filterNavItems = (items: NavItem[], query: string): NavItem[] => {
  if (!query.trim()) return items;

  const lowerQuery = query.toLowerCase();

  return items.reduce((acc, item) => {
    const matchesLabel = item.label.toLowerCase().includes(lowerQuery);
    const filteredChildren = item.children
      ? filterNavItems(item.children, query)
      : [];

    if (matchesLabel || filteredChildren.length > 0) {
      acc.push({
        ...item,
        children:
          filteredChildren.length > 0 ? filteredChildren : item.children,
      });
    }

    return acc;
  }, [] as NavItem[]);
};
