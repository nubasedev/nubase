# Data Grid Virtualization

This data grid virtualizes both rows and columns so large datasets stay responsive. These notes summarize the moving parts and how they interact.

## Viewport Dimensions

- `useGridDimensions` watches the grid element with a `ResizeObserver`.
- The hook reports the grid’s inline (`gridWidth`) and block (`gridHeight`) size, plus the horizontal scrollbar height.
- When virtualization is enabled and the grid has no explicit `height` style, `DataGrid` applies an internal fallback height of up to 600&nbsp;px. This guarantees a bounded viewport so the observer returns a realistic `gridHeight`. If the user passes `style={{ height: ... }}` (or any consumer-specific class), that value wins and the fallback is skipped.

## Row Virtualization

- `useViewportRows` receives the full row list, the configured row height, current scroll offset, and the viewport height from `useGridDimensions`.
- It computes:
  - `totalRowHeight` – the aggregate height of all rows.
  - `findRowIdx(offset)` – maps a scroll offset back to a row index.
  - `rowOverscanStartIdx` / `rowOverscanEndIdx` – the slice of rows actually rendered. Overscan extends 4 rows beyond the visible window to avoid pop-in while scrolling.
- The raw rows array is never truncated. Instead, `getViewportRows` in `DataGrid` maps the overscan range to `<Row>` elements, so only a small subset mounts in the DOM.

## Column Virtualization

- `useCalculatedColumns` prepares calculated column metadata (widths, frozen column offsets, etc.).
- Given the current scroll position, it determines a column overscan window (`colOverscanStartIdx`/`colOverscanEndIdx`) that includes frozen columns and a buffer of scrollable columns.
- `useViewportColumns` ensures any column that spans visible cells joins the viewport slice, preventing partially visible groups from being hidden.
- `Row` always renders cells for the supplied viewport columns, so unfrozen columns outside the overscan window never mount.

## Putting It Together

- The grid sets `gridTemplateRows`/`gridTemplateColumns` CSS variables for layout, but only renders the overscanned rows and columns as actual DOM nodes.
- Scrolling updates the stored `scrollTop`/`scrollLeft`, which recomputes both viewport slices via memoized hooks.
- Summary/header rows remain sticky because their height is included in the overall scroll calculations.

## Tips for Consumers

- Virtualization is enabled by default. You can disable it per instance with `<DataGrid enableVirtualization={false} />` if you truly need every cell rendered.
- Provide an explicit height (`style={{ height: "500px" }}` or CSS class) when embedding the grid. If omitted, the grid’s internal fallback height keeps virtualization active but you may want tighter control per layout.
- Prefer numeric `rowHeight` for best performance. Variable-height rows are supported but require precomputing all row positions.
- Overscan defaults are conservative; adjust via feature requests if you have specific scroll jitter concerns.
