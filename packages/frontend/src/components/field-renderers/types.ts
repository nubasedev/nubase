import type { BaseSchema, SchemaMetadata } from "@nubase/core";
import type { AnyFieldApi } from "@tanstack/react-form";
import type React from "react";
import type { EditFieldLifecycle } from "../form/FormFieldRenderer/renderer-factory";

// =============================================================================
// Form Field Renderer Types (TanStack Form integration)
// =============================================================================

export type ViewFieldRendererProps = {
  schema: BaseSchema<any>;
  fieldState: AnyFieldApi;
  metadata: SchemaMetadata<any>;
};

export type ViewFieldRenderer = (
  props: ViewFieldRendererProps,
) => React.ReactElement<{ id?: string }>;

export type EditFieldRendererProps = {
  schema: BaseSchema<any>;
  fieldState: AnyFieldApi;
  hasError: boolean;
  metadata: SchemaMetadata<any>;
};

export type EditFieldRendererResult = {
  element: React.ReactElement<{ id?: string; hasError?: boolean }>;
  lifecycle?: EditFieldLifecycle;
  /**
   * When true, the field will auto-commit on value change without requiring
   * the user to click the check button. Suitable for Toggle and Select fields.
   */
  autoCommit?: boolean;
};

export type EditFieldRenderer = (
  props: EditFieldRendererProps,
) => EditFieldRendererResult;

export type ViewFieldRendererMap = Record<string, ViewFieldRenderer>;
export type EditFieldRendererMap = Record<string, EditFieldRenderer>;

// =============================================================================
// Cell Renderer Types (for DataGrid/Table, simpler - no TanStack Form)
// =============================================================================

/**
 * Lifecycle callbacks for cell edit components.
 * Matches the EditFieldLifecycle interface for consistency.
 */
export interface CellEditLifecycle {
  /** Called when edit mode starts */
  onEnterEdit?: () => void;
  /** Called when edit mode ends */
  onExitEdit?: () => void;
  /** Called for auto-commit fields when value should be committed */
  onValueCommit?: (value?: unknown) => void;
}

/**
 * Props for cell view renderers - simple value display.
 */
export type CellViewRendererProps = {
  value: any;
  metadata?: SchemaMetadata;
};

/**
 * Props for cell edit renderers - inline editing in table cells.
 */
export type CellEditRendererProps = {
  value: any;
  onChange: (value: any) => void;
  hasError: boolean;
  metadata?: SchemaMetadata;
};

/**
 * Result from cell edit renderers.
 */
export type CellEditRendererResult = {
  element: React.ReactElement;
  lifecycle: CellEditLifecycle;
  /**
   * When true, the cell will auto-commit on value change without requiring
   * the user to click save. Suitable for Toggle fields.
   */
  autoCommit?: boolean;
};

/**
 * Cell view renderer function type - returns simple display content.
 */
export type CellViewRenderer = (
  props: CellViewRendererProps,
) => React.ReactNode;

/**
 * Cell edit renderer function type - returns edit component with lifecycle.
 */
export type CellEditRenderer = (
  props: CellEditRendererProps,
) => CellEditRendererResult;

export type CellViewRendererMap = Record<string, CellViewRenderer>;
export type CellEditRendererMap = Record<string, CellEditRenderer>;
