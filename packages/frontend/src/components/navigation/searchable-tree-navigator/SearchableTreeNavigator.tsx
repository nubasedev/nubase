import {
  forwardRef,
  type RefObject,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { SearchTextInput } from "../../form-controls/controls/SearchTextInput/SearchTextInput";
import { TreeNavigator, type TreeNavigatorItem } from "./TreeNavigator";

export type SearchableTreeNavigatorProps = {
  items: TreeNavigatorItem[];
  placeHolder: string;
  height?: "full" | number | string;
};

export const SearchableTreeNavigator = forwardRef<
  HTMLInputElement,
  SearchableTreeNavigatorProps
>((props, ref) => {
  const internalRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Expose the internal ref through the forwarded ref
  useImperativeHandle(ref, () => internalRef.current as HTMLInputElement, []);

  // Focus the search input when the component comes into view
  useEffect(() => {
    if (internalRef.current) {
      internalRef.current.focus();
    }
  }, []);

  // Filter items based on search query (flattens tree structure for search)
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return props.items;
    }

    const query = searchQuery.toLowerCase();

    const flattenAndFilter = (
      items: TreeNavigatorItem[],
    ): TreeNavigatorItem[] => {
      const result: TreeNavigatorItem[] = [];

      for (const item of items) {
        const matchesSearch =
          item.title.toLowerCase().includes(query) ||
          item.subtitle?.toLowerCase().includes(query);

        if (matchesSearch) {
          result.push({ ...item, children: undefined }); // Remove children for search results
        }

        if (item.children) {
          result.push(...flattenAndFilter(item.children));
        }
      }

      return result;
    };

    return flattenAndFilter(props.items);
  }, [props.items, searchQuery]);

  // Calculate container height and styles
  const getContainerStyle = () => {
    if (props.height === "full") {
      return { height: "100%" };
    }
    if (typeof props.height === "number") {
      return { height: `${props.height}px` };
    }
    if (typeof props.height === "string") {
      return { height: props.height };
    }
    return {};
  };

  return (
    <div
      className={props.height ? "flex flex-col gap-2" : "space-y-2"}
      style={getContainerStyle()}
    >
      {/* Search Input - Always visible */}
      <div className="flex-shrink-0">
        <SearchTextInput
          ref={internalRef}
          placeholder={props.placeHolder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Navigator List - Scrollable */}
      <div className={props.height ? "flex-1 overflow-y-auto min-h-0" : ""}>
        <TreeNavigator
          items={filteredItems}
          searchInputRef={internalRef as RefObject<HTMLInputElement>}
        />
      </div>
    </div>
  );
});

SearchableTreeNavigator.displayName = "SearchableTreeNavigator";

// Backward compatibility export
export const SearchableListNavigator = SearchableTreeNavigator;
export type SearchableListNavigatorProps = SearchableTreeNavigatorProps;
