import type { ObjectSchema } from "@nubase/core";
import { cn } from "../../styling/cn";
import { NqlEditor } from "../nql-editor";
import { NuLookupSelectFilter } from "../search-controls/NuLookupSelectFilter";
import { SearchFilterBar } from "../search-controls/SearchFilterBar";
import {
  SelectFilter,
  type SelectFilterOption,
} from "../search-controls/SelectFilter";
import { TextFilter } from "../search-controls/TextFilter";
import { ToggleGroup, ToggleGroupItem } from "../toggle-group";
import type { FilterFieldDescriptor, SchemaFilterState } from "./types";

export type SchemaFilterBarProps<TSchema extends ObjectSchema<any>> = {
  /** The schema the filter bar is driven by. Used for NQL field completion. */
  schema?: TSchema;

  /** Filter field descriptors from introspection */
  filterDescriptors: FilterFieldDescriptor[];

  /** Current filter state */
  filterState: SchemaFilterState<TSchema>;

  /** Callback when a filter value changes */
  onFilterChange: (field: string, value: unknown) => void;

  /** Global search value (optional) */
  searchValue?: string;

  /** Callback when search changes */
  onSearchChange?: (value: string) => void;

  /** Search placeholder */
  searchPlaceholder?: string;

  /** Callback for clear filters button */
  onClearFilters?: () => void;

  /** Whether to show the clear filters button (default: true) */
  showClearFilters?: boolean;

  /** Debounce delay for search input (default: 300) */
  searchDebounceMs?: number;

  /** Whether the filter bar is disabled */
  disabled?: boolean;

  /** Additional className for the container */
  className?: string;

  /**
   * NQL mode toggle state. When `true`, the structured filter controls are
   * hidden and an NQL text editor is shown in their place. When `false`
   * (default), the structured controls behave as before and the NQL input
   * is not rendered.
   */
  nqlMode?: boolean;

  /** Called when the user flips the NQL/Filters toggle. */
  onNqlModeChange?: (enabled: boolean) => void;

  /** Current NQL expression text (only used when nqlMode is true). */
  nqlValue?: string;

  /** Called on every NQL text change. */
  onNqlValueChange?: (value: string) => void;

  /**
   * Inline error message shown under the NQL input. Typically populated
   * from a 400 response from the backend's NQL compiler.
   */
  nqlErrorMessage?: string;

  /**
   * Presentation mode.
   *
   * - `"full"` (default): toggle is labelled `Filters / NQL`. The non-NQL
   *   branch shows the search input plus one chip per filter descriptor.
   *   Used by top-level resource search pages where users want fine-grained
   *   filtering.
   * - `"simplified"`: toggle is labelled `Search / NQL`. The non-NQL branch
   *   shows only the search input — per-field chips and the clear button
   *   are hidden. Used inside view overlays (e.g. tickets on a user) where
   *   a single search box plus optional NQL is enough.
   *
   * `mode` is purely presentational; `filterState` is not cleared when the
   * caller switches modes, so a hook driving both a full bar and a
   * simplified bar elsewhere keeps its per-field state intact.
   */
  mode?: "full" | "simplified";
};

// Boolean filter options
const BOOLEAN_OPTIONS: SelectFilterOption<string>[] = [
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
];

/**
 * Renders a filter bar based on schema-derived filter descriptors.
 *
 * @example
 * ```tsx
 * const { filterState, setFilterValue, clearFilters, filterDescriptors } =
 *   useSchemaFilters(filterSchema);
 *
 * <SchemaFilterBar
 *   filterDescriptors={filterDescriptors}
 *   filterState={filterState}
 *   onFilterChange={setFilterValue}
 *   onClearFilters={clearFilters}
 * />
 * ```
 */
export function SchemaFilterBar<TSchema extends ObjectSchema<any>>({
  schema,
  filterDescriptors,
  filterState,
  onFilterChange,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  onClearFilters,
  showClearFilters = true,
  searchDebounceMs = 300,
  disabled = false,
  className,
  nqlMode = false,
  onNqlModeChange,
  nqlValue = "",
  onNqlValueChange,
  nqlErrorMessage,
  mode = "full",
}: SchemaFilterBarProps<TSchema>) {
  const canToggleNql = Boolean(onNqlModeChange && schema && onNqlValueChange);
  const isSimplified = mode === "simplified";
  const filtersToggleLabel = isSimplified ? "Search" : "Filters";
  const modeToggle = canToggleNql ? (
    <ToggleGroup
      type="single"
      value={nqlMode ? "nql" : "filters"}
      onValueChange={(value) => {
        // ToggleGroup with type="single" can emit an empty string when the
        // user clicks the active item; guard against that.
        if (value === "nql" || value === "filters") {
          onNqlModeChange?.(value === "nql");
        }
      }}
      variant="outline"
      disabled={disabled}
      aria-label="Filter mode"
    >
      <ToggleGroupItem value="filters" className="px-3">
        {filtersToggleLabel}
      </ToggleGroupItem>
      <ToggleGroupItem value="nql" className="px-3">
        NQL
      </ToggleGroupItem>
    </ToggleGroup>
  ) : null;
  // Render a filter control based on the descriptor
  const renderFilter = (descriptor: FilterFieldDescriptor) => {
    const currentValue =
      filterState[descriptor.name as keyof typeof filterState];

    switch (descriptor.filterType) {
      case "text": {
        // Text filter for string and number fields
        const stringValue =
          currentValue !== undefined && currentValue !== null
            ? String(currentValue)
            : "";

        return (
          <TextFilter
            key={descriptor.name}
            label={descriptor.label}
            value={stringValue}
            onChange={(value) => {
              // Convert to number for number schema types
              if (descriptor.schemaType === "number") {
                const numValue = value === "" ? undefined : Number(value);
                onFilterChange(
                  descriptor.name,
                  Number.isNaN(numValue) ? undefined : numValue,
                );
              } else {
                onFilterChange(descriptor.name, value || undefined);
              }
            }}
            placeholder={
              descriptor.metadata.description ||
              `Filter by ${descriptor.label.toLowerCase()}...`
            }
            disabled={disabled}
          />
        );
      }

      case "lookup": {
        // Lookup filter for fields with lookupResource
        if (!descriptor.lookupResource) {
          return null;
        }

        // Ensure value is an array for multi-select
        const arrayValue = Array.isArray(currentValue)
          ? currentValue
          : currentValue !== undefined && currentValue !== null
            ? [currentValue]
            : [];

        return (
          <NuLookupSelectFilter
            key={descriptor.name}
            label={descriptor.label}
            lookupResource={descriptor.lookupResource}
            value={arrayValue as (string | number)[]}
            onChange={(value) => {
              // Store as array for multi-select support
              onFilterChange(
                descriptor.name,
                value.length > 0 ? value : undefined,
              );
            }}
            disabled={disabled}
          />
        );
      }

      case "boolean": {
        // Boolean filter using SelectFilter with Yes/No options
        const selectedValues: string[] = [];
        if (currentValue === true || currentValue === "true") {
          selectedValues.push("true");
        } else if (currentValue === false || currentValue === "false") {
          selectedValues.push("false");
        }

        return (
          <SelectFilter
            key={descriptor.name}
            label={descriptor.label}
            options={BOOLEAN_OPTIONS}
            value={selectedValues}
            onChange={(values) => {
              if (values.length === 0) {
                onFilterChange(descriptor.name, undefined);
              } else {
                // Take the last selected value (allows toggling)
                const lastValue = values[values.length - 1];
                onFilterChange(descriptor.name, lastValue === "true");
              }
            }}
            disabled={disabled}
          />
        );
      }

      default:
        return null;
    }
  };

  // Hide the bar when nothing meaningful would render. In simplified mode
  // the search input alone (driven by `onSearchChange`) is enough to keep
  // the bar visible; the per-field descriptors are not used.
  const hasMeaningfulContent = isSimplified
    ? Boolean(onSearchChange) || canToggleNql
    : filterDescriptors.length > 0 || canToggleNql;
  if (!hasMeaningfulContent) {
    return null;
  }

  if (nqlMode && canToggleNql && schema) {
    return (
      <div className={cn("flex items-start gap-2 flex-wrap", className)}>
        {modeToggle}
        <NqlEditor
          schema={schema}
          value={nqlValue}
          onChange={onNqlValueChange ?? (() => {})}
          errorMessage={nqlErrorMessage}
        />
      </div>
    );
  }

  // Toggle is passed as `leading` so every control (toggle, search,
  // filter chips, clear button) lives in the *same* flex-wrap container
  // and reflows as one row when the viewport narrows — no orphan mode
  // toggle on its own line above the rest.
  return (
    <SearchFilterBar
      searchValue={searchValue}
      onSearchChange={onSearchChange || (() => {})}
      searchPlaceholder={searchPlaceholder}
      searchDebounceMs={searchDebounceMs}
      searchExpand={isSimplified}
      onClearFilters={onClearFilters}
      showClearFilters={isSimplified ? false : showClearFilters}
      disabled={disabled}
      className={cn(className)}
      leading={modeToggle}
    >
      {isSimplified ? null : filterDescriptors.map(renderFilter)}
    </SearchFilterBar>
  );
}

SchemaFilterBar.displayName = "SchemaFilterBar";
