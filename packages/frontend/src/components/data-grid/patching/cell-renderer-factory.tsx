import type { SchemaMetadata } from "@nubase/core";
import { BooleanCellEditRenderer } from "../../field-renderers/boolean/BooleanCellEditRenderer";
import { BooleanCellViewRenderer } from "../../field-renderers/boolean/BooleanCellViewRenderer";
import { NumberCellEditRenderer } from "../../field-renderers/number/NumberCellEditRenderer";
import { NumberCellViewRenderer } from "../../field-renderers/number/NumberCellViewRenderer";
import { StringCellEditRenderer } from "../../field-renderers/string/StringCellEditRenderer";
import { StringCellViewRenderer } from "../../field-renderers/string/StringCellViewRenderer";
import type {
  CellEditRenderer,
  CellEditRendererMap,
  CellEditRendererProps,
  CellEditRendererResult,
  CellViewRenderer,
  CellViewRendererMap,
} from "../../field-renderers/types";

/**
 * Map of schema type to cell view renderer.
 */
const cellViewRenderers: CellViewRendererMap = {
  string: StringCellViewRenderer,
  number: NumberCellViewRenderer,
  boolean: BooleanCellViewRenderer,
};

/**
 * Map of schema type to cell edit renderer.
 */
const cellEditRenderers: CellEditRendererMap = {
  string: StringCellEditRenderer,
  number: NumberCellEditRenderer,
  boolean: BooleanCellEditRenderer,
};

/**
 * Resolves a cell view renderer based on schema type.
 * Falls back to StringCellViewRenderer for unknown types.
 */
export function resolveCellViewRenderer(schemaType: string): CellViewRenderer {
  return cellViewRenderers[schemaType] ?? StringCellViewRenderer;
}

/**
 * Resolves a cell edit renderer based on schema type.
 * Falls back to StringCellEditRenderer for unknown types.
 */
export function resolveCellEditRenderer(schemaType: string): CellEditRenderer {
  return cellEditRenderers[schemaType] ?? StringCellEditRenderer;
}

/**
 * Helper function to render a cell view for a given schema type and value.
 */
export function renderCellView(
  schemaType: string,
  value: any,
  metadata?: SchemaMetadata,
): React.ReactNode {
  const renderer = resolveCellViewRenderer(schemaType);
  return renderer({ value, metadata });
}

/**
 * Helper function to render a cell edit for a given schema type.
 */
export function renderCellEdit(
  schemaType: string,
  props: CellEditRendererProps,
): CellEditRendererResult {
  const renderer = resolveCellEditRenderer(schemaType);
  return renderer(props);
}
